import { NextRequest } from 'next/server';
import { proxyRequest, ProxyConfig } from '@/lib/proxy-utils';

// Runtime configuration for Vercel
export const runtime = 'nodejs';
export const maxDuration = 60;

function stripN8nSignature(body: string): string {
  if (!body) return body;
  try {
    const data = JSON.parse(body) as Record<string, unknown>;
    if (typeof data.text === 'string') {
      data.text = data.text
        .replace(/\n*\s*This message was sent automatically with n8n\s*\n*/gi, '\n')
        .trim();
    }
    if (typeof data.caption === 'string') {
      data.caption = data.caption
        .replace(/\n*\s*This message was sent automatically with n8n\s*\n*/gi, '\n')
        .trim();
    }
    return JSON.stringify(data);
  } catch {
    return body.replace(/\n*\s*This message was sent automatically with n8n\s*\n*/gi, '\n').trim();
  }
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

