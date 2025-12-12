import { NextRequest } from 'next/server';
import { proxyRequest, ProxyConfig } from '@/lib/proxy-utils';

// Runtime configuration for Vercel
export const runtime = 'nodejs';
export const maxDuration = 60;

const OPENAI_CONFIG: ProxyConfig = {
  baseUrl: 'https://api.openai.com',
  pathPrefix: '/openai',
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> | { path: string[] } }
) {
  const resolvedParams = await Promise.resolve(params);
  return proxyRequest(request, OPENAI_CONFIG, resolvedParams.path);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> | { path: string[] } }
) {
  const resolvedParams = await Promise.resolve(params);
  return proxyRequest(request, OPENAI_CONFIG, resolvedParams.path);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> | { path: string[] } }
) {
  const resolvedParams = await Promise.resolve(params);
  return proxyRequest(request, OPENAI_CONFIG, resolvedParams.path);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> | { path: string[] } }
) {
  const resolvedParams = await Promise.resolve(params);
  return proxyRequest(request, OPENAI_CONFIG, resolvedParams.path);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> | { path: string[] } }
) {
  const resolvedParams = await Promise.resolve(params);
  return proxyRequest(request, OPENAI_CONFIG, resolvedParams.path);
}

export async function HEAD(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> | { path: string[] } }
) {
  const resolvedParams = await Promise.resolve(params);
  return proxyRequest(request, OPENAI_CONFIG, resolvedParams.path);
}

export async function OPTIONS(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> | { path: string[] } }
) {
  const resolvedParams = await Promise.resolve(params);
  return proxyRequest(request, OPENAI_CONFIG, resolvedParams.path);
}

