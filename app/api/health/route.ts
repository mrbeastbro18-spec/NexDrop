import { NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { env } from '@/lib/env';

export const runtime = 'nodejs';

export async function GET() {
  const requestId = randomUUID();

  return NextResponse.json({
    ok: true,
    service: 'nexdrop',
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime())
  }, { headers: { 'x-request-id': requestId } });
}
