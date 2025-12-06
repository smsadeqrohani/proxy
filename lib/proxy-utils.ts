import { NextRequest, NextResponse } from 'next/server';

export interface ProxyConfig {
  baseUrl: string;
  pathPrefix: string;
}

export interface ProxyError {
  ok: false;
  error: string;
  message: string;
}

/**
 * Validates the internal authentication token from the request headers
 */
export function validateInternalToken(request: NextRequest): boolean {
  const token = request.headers.get('X-Internal-Token');
  const expectedToken = process.env.INTERNAL_PROXY_TOKEN;

  if (!expectedToken) {
    console.error('INTERNAL_PROXY_TOKEN environment variable is not set');
    return false;
  }

  return token === expectedToken;
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
): HeadersInit {
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
  // Validate authentication
  if (!validateInternalToken(request)) {
    return createAuthErrorResponse();
  }

  // Build target URL
  const path = pathSegments.join('/');
  const searchParams = request.nextUrl.searchParams.toString();
  const targetUrl = `${config.baseUrl}/${path}${searchParams ? `?${searchParams}` : ''}`;

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
        body = await request.text();
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

