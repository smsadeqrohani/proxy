import { NextRequest } from 'next/server';
import { proxyRequest, ProxyConfig } from '@/lib/proxy-utils';

// Runtime configuration for Vercel
export const runtime = 'nodejs';
export const maxDuration = 60;

// Match the n8n footer with any line endings and surrounding whitespace
const N8N_PATTERN = /[\r\n]*\s*This message was sent automatically with n8n\s*[\r\n]*/gi;

function cleanText(text: string): string {
  return text.replace(N8N_PATTERN, '\n').trim();
}

/** Parse multipart/form-data and strip n8n signature from text/caption parts. Rebuilds body. */
function stripFromMultipart(body: string, boundary: string): string {
  const delim = '\r\n--' + boundary;
  const parts = body.split(delim);
  const processed: string[] = [];

  for (let i = 1; i < parts.length; i++) {
    const raw = parts[i];
    if (raw === '--' || raw.startsWith('--\r') || raw.startsWith('--\n')) break;
    const headerEnd = raw.indexOf('\r\n\r\n');
    if (headerEnd === -1) {
      processed.push(raw);
      continue;
    }
    const headers = raw.slice(0, headerEnd);
    let content = raw.slice(headerEnd + 4);
    const nameMatch = headers.match(/name="([^"]+)"/i);
    const name = nameMatch ? nameMatch[1].toLowerCase() : '';
    if ((name === 'text' || name === 'caption') && content) {
      content = content.replace(/\r?\n--\s*$/, '');
      content = cleanText(content) + (raw.endsWith('\r\n') ? '\r\n' : '\n');
    }
    processed.push(headers + '\r\n\r\n' + content);
  }

  const sep = '--' + boundary + '\r\n';
  let result = sep + processed.join(sep);
  if (body.includes('--' + boundary + '--')) result += '--' + boundary + '--\r\n';
  return result;
}

function stripN8nSignature(body: string, request: NextRequest): string {
  if (!body) return body;

  const contentType = request.headers.get('content-type') ?? '';

  // 1) Multipart/form-data (n8n Telegram node often sends this)
  if (contentType.includes('multipart/form-data')) {
    const boundaryMatch = contentType.match(/boundary=([^;\s]+)/i);
    const boundary = boundaryMatch ? boundaryMatch[1].trim().replace(/^["']|["']$/g, '') : null;
    if (boundary && body.includes('--' + boundary)) {
      return stripFromMultipart(body, boundary);
    }
  }

  // 2) JSON body (e.g. Content-Type: application/json)
  try {
    const data = JSON.parse(body) as Record<string, unknown>;
    if (typeof data.text === 'string') {
      data.text = cleanText(data.text);
    }
    if (typeof data.caption === 'string') {
      data.caption = cleanText(data.caption);
    }
    return JSON.stringify(data);
  } catch {
    // not JSON
  }

  // 3) Form-urlencoded (e.g. application/x-www-form-urlencoded)
  try {
    const params = new URLSearchParams(body);
    let changed = false;
    for (const [key, value] of Array.from(params.entries())) {
      if (value == null) continue;
      if (key.toLowerCase() === 'text' || key.toLowerCase() === 'caption') {
        const cleaned = cleanText(value);
        if (cleaned !== value) {
          params.set(key, cleaned);
          changed = true;
        }
      }
    }
    if (changed || params.has('text') || params.has('caption')) return params.toString();
  } catch {
    // not form
  }

  // 4) Plain text fallback: strip anywhere in body
  return body.replace(N8N_PATTERN, '\n').replace(/\n+$/, '');
}

const TELEGRAM_CONFIG: ProxyConfig = {
  baseUrl: 'https://api.telegram.org',
  pathPrefix: '/telegram',
  transformRequestBody: stripN8nSignature,
};

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxyRequest(request, TELEGRAM_CONFIG, params.path);
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxyRequest(request, TELEGRAM_CONFIG, params.path);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxyRequest(request, TELEGRAM_CONFIG, params.path);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxyRequest(request, TELEGRAM_CONFIG, params.path);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxyRequest(request, TELEGRAM_CONFIG, params.path);
}

export async function HEAD(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxyRequest(request, TELEGRAM_CONFIG, params.path);
}

export async function OPTIONS(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxyRequest(request, TELEGRAM_CONFIG, params.path);
}

