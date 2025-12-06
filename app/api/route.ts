import { NextResponse } from 'next/server';

/**
 * Root API route - returns 404 for any unmatched paths
 */
export async function GET() {
  return NextResponse.json(
    {
      ok: false,
      error: 'NOT_FOUND',
      message: 'Only /api/openai/* and /api/telegram/* paths are supported',
    },
    { status: 404 }
  );
}

