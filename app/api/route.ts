import { NextRequest, NextResponse } from 'next/server';
import { proxyRequest, ProxyConfig } from '@/lib/proxy-utils';

// Runtime configuration for Vercel
export const runtime = 'nodejs';
export const maxDuration = 60;

const TELEGRAM_CONFIG: ProxyConfig = {
  baseUrl: 'https://api.telegram.org',
  pathPrefix: '/telegram',
};

/**
 * Root API route - proxies to Telegram API
 * Handles requests to /api/* and forwards them to Telegram
 */
export async function GET(request: NextRequest) {
  // Extract path from URL (remove /api prefix)
  const url = new URL(request.url);
  const pathSegments = url.pathname.replace('/api', '').split('/').filter(Boolean);
  
  // If no path segments, return info message
  if (pathSegments.length === 0) {
    return NextResponse.json(
      {
        ok: true,
        message: 'Telegram Proxy API',
        endpoints: ['/api/telegram/*', '/api/openai/*'],
      },
      { status: 200 }
    );
  }
  
  // Proxy to Telegram
  return proxyRequest(request, TELEGRAM_CONFIG, pathSegments);
}

export async function POST(request: NextRequest) {
  const url = new URL(request.url);
  const pathSegments = url.pathname.replace('/api', '').split('/').filter(Boolean);
  return proxyRequest(request, TELEGRAM_CONFIG, pathSegments);
}

export async function PUT(request: NextRequest) {
  const url = new URL(request.url);
  const pathSegments = url.pathname.replace('/api', '').split('/').filter(Boolean);
  return proxyRequest(request, TELEGRAM_CONFIG, pathSegments);
}

export async function PATCH(request: NextRequest) {
  const url = new URL(request.url);
  const pathSegments = url.pathname.replace('/api', '').split('/').filter(Boolean);
  return proxyRequest(request, TELEGRAM_CONFIG, pathSegments);
}

export async function DELETE(request: NextRequest) {
  const url = new URL(request.url);
  const pathSegments = url.pathname.replace('/api', '').split('/').filter(Boolean);
  return proxyRequest(request, TELEGRAM_CONFIG, pathSegments);
}

export async function HEAD(request: NextRequest) {
  const url = new URL(request.url);
  const pathSegments = url.pathname.replace('/api', '').split('/').filter(Boolean);
  return proxyRequest(request, TELEGRAM_CONFIG, pathSegments);
}

export async function OPTIONS(request: NextRequest) {
  const url = new URL(request.url);
  const pathSegments = url.pathname.replace('/api', '').split('/').filter(Boolean);
  return proxyRequest(request, TELEGRAM_CONFIG, pathSegments);
}

