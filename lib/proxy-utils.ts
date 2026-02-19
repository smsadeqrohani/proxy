import { NextRequest, NextResponse } from 'next/server';

export interface ProxyConfig {
  baseUrl: string;
  pathPrefix: string;
  /** Optional: transform request body before forwarding to upstream (e.g. strip signatures) */
  transformRequestBody?: (body: string) => string;
}

export interface ProxyError {
  ok: false;
  error: string;
  message: string;
}

/**
 * Validates the internal authentication token from the request headers or query params
 * Authentication can be disabled by setting DISABLE_AUTH=true or leaving INTERNAL_PROXY_TOKEN unset
 * Token can be provided via X-Internal-Token header or ?token= query parameter
 */
export function validateInternalToken(request: NextRequest): boolean {
  // If authentication is explicitly disabled, skip it
  if (process.env.DISABLE_AUTH === 'true') {
    return true;
  }

  const expectedToken = process.env.INTERNAL_PROXY_TOKEN;

  // If no token is configured, skip authentication (optional auth mode)
  if (!expectedToken) {
    return true;
  }

  // If token is configured, validate it from header or query param
  const headerToken = request.headers.get('X-Internal-Token');
  const queryToken = request.nextUrl.searchParams.get('token');
  const providedToken = headerToken || queryToken;
  
  return providedToken === expectedToken;
}

/**
 * Creates an error response for authentication failures
 */
export function createAuthErrorResponse(): NextResponse<ProxyError> {
  return NextResponse.json(
    {
      ok: false,
      error: 'AUTHENTICATION_ERROR',
      message: 'Missing or invalid X-Internal-Token header',
    },
    { status: 401 }
  );
}

/**
 * Creates an error response for upstream service failures
 */
export function createUpstreamErrorResponse(
  message: string
): NextResponse<ProxyError> {
  return NextResponse.json(
    {
      ok: false,
      error: 'UPSTREAM_ERROR',
      message,
    },
    { status: 502 }
  );
}

/**
 * Extracts headers from the incoming request that should be forwarded
 * Excludes host, connection, and other proxy-specific headers
 */
export function extractForwardableHeaders(
  request: NextRequest
): Headers {
  const headers = new Headers();

  // Forward relevant headers
  const forwardableHeaders = [
    'authorization',
    'content-type',
    'accept',
    'accept-encoding',
    'accept-language',
    'user-agent',
    'x-requested-with',
    'openai-organization',
    'openai-project',
  ];

  for (const headerName of forwardableHeaders) {
    const value = request.headers.get(headerName);
    if (value) {
      headers.set(headerName, value);
    }
  }

  // Forward any custom headers that might be needed
  request.headers.forEach((value, key) => {
    if (
      !key.startsWith('x-internal-') &&
      !key.startsWith('x-forwarded-') &&
      !key.startsWith('x-vercel-') &&
      key !== 'host' &&
      key !== 'connection' &&
      key !== 'content-length'
    ) {
      // Only add if not already set by forwardableHeaders
      if (!headers.has(key.toLowerCase())) {
        headers.set(key, value);
      }
    }
  });

  return headers;
}

/**
 * Logs proxy request information (without sensitive data)
 */
export function logProxyRequest(
  targetUrl: string,
  method: string,
  hasAuth: boolean
): void {
  console.log(
    `[PROXY] ${method} ${targetUrl} - Auth: ${hasAuth ? 'present' : 'missing'}`
  );
}

/**
 * Logs proxy response information
 */
export function logProxyResponse(targetUrl: string, status: number): void {
  console.log(`[PROXY] Response from ${targetUrl} - Status: ${status}`);
}

/**
 * Proxies a request to an upstream service
 */
export async function proxyRequest(
  request: NextRequest,
  config: ProxyConfig,
  pathSegments: string[]
): Promise<NextResponse> {
  // Validate authentication (only if INTERNAL_PROXY_TOKEN is set)
  if (!validateInternalToken(request)) {
    return createAuthErrorResponse();
  }

  // Build target URL
  const path = pathSegments.filter(Boolean).join('/');
  const searchParams = request.nextUrl.searchParams.toString();
  const targetUrl = path 
    ? `${config.baseUrl}/${path}${searchParams ? `?${searchParams}` : ''}`
    : `${config.baseUrl}${searchParams ? `?${searchParams}` : ''}`;

  // Extract headers
  const headers = extractForwardableHeaders(request);
  const hasAuth = request.headers.has('authorization');

  // Log request
  logProxyRequest(targetUrl, request.method, hasAuth);

  try {
    // Get request body if present
    let body: BodyInit | undefined;
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      try {
        let bodyText = await request.text();
        if (config.transformRequestBody && bodyText) {
          bodyText = config.transformRequestBody(bodyText);
        }
        body = bodyText;
      } catch (error) {
        // Body might not be available or already consumed
        body = undefined;
      }
    }

    // Forward request to upstream
    const upstreamResponse = await fetch(targetUrl, {
      method: request.method,
      headers,
      body,
    });

    // Log response
    logProxyResponse(targetUrl, upstreamResponse.status);

    // Extract response body
    const responseBody = await upstreamResponse.text();

    // Create response with same status and headers
    const response = new NextResponse(responseBody, {
      status: upstreamResponse.status,
      statusText: upstreamResponse.statusText,
    });

    // Copy relevant response headers
    const contentType = upstreamResponse.headers.get('content-type');
    if (contentType) {
      response.headers.set('content-type', contentType);
    }

    // Copy other relevant headers
    upstreamResponse.headers.forEach((value, key) => {
      if (
        key.toLowerCase() !== 'content-encoding' &&
        key.toLowerCase() !== 'transfer-encoding'
      ) {
        response.headers.set(key, value);
      }
    });

    return response;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred';
    console.error(`[PROXY] Error proxying to ${targetUrl}:`, errorMessage);
    return createUpstreamErrorResponse(errorMessage);
  }
}

