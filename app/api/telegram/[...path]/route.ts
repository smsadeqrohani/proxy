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

function stripN8nSignature(body: string): string {
  if (!body) return body;

  // 1) JSON body (e.g. Content-Type: application/json)
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

  // 2) Form-urlencoded (e.g. n8n → application/x-www-form-urlencoded)
  try {
    const params = new URLSearchParams(body);
    const textKey = [...params.keys()].find((k) => k.toLowerCase() === 'text');
    const captionKey = [...params.keys()].find((k) => k.toLowerCase() === 'caption');
    let changed = false;
    if (textKey) {
      const value = params.get(textKey);
      if (value != null) {
        const cleaned = cleanText(value);
        if (cleaned !== value) {
          params.set(textKey, cleaned);
          changed = true;
        }
      }
    }
    if (captionKey) {
      const value = params.get(captionKey);
      if (value != null) {
        const cleaned = cleanText(value);
        if (cleaned !== value) {
          params.set(captionKey, cleaned);
          changed = true;
        }
      }
    }
    if (changed || textKey || captionKey) return params.toString();
  } catch {
    // not form
  }

  // 3) Plain text fallback: strip anywhere in body (e.g. multipart or raw)
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

