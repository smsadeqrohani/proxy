import { NextRequest } from 'next/server';
import { proxyRequest, ProxyConfig } from '@/lib/proxy-utils';

// Runtime configuration for Vercel
export const runtime = 'nodejs';
export const maxDuration = 60;

const TELEGRAM_CONFIG: ProxyConfig = {
  baseUrl: 'https://api.telegram.org',
  pathPrefix: '/telegram',
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

