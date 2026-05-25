import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logServerError } from '@/lib/logger';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const requestId = randomUUID();

  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403, headers: { 'x-request-id': requestId } });
  }

  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: { id: true, email: true, fullName: true, role: true, createdAt: true }
    });
    return NextResponse.json({ users }, { headers: { 'x-request-id': requestId } });
  } catch (err) {
    logServerError('admin.users.list_failed', err, { requestId });
    return NextResponse.json({ error: 'Failed to load users' }, { status: 500, headers: { 'x-request-id': requestId } });
  }
}

export async function PATCH(req: NextRequest) {
  const requestId = randomUUID();

  try {
    await requireAdmin();

    // CSRF guard for state-changing admin actions
    const csrfHeader = req.headers.get('x-csrf-token') || '';
    const csrfCookie = req.cookies.get('nd_csrf')?.value || '';
    if (!csrfHeader || !csrfCookie || csrfHeader !== csrfCookie) {
      return NextResponse.json({ error: 'CSRF validation failed' }, { status: 403, headers: { 'x-request-id': requestId } });
    }

    const body = await req.json();
    const { id, action } = body || {};
    if (!id || !action) return NextResponse.json({ error: 'Invalid' }, { status: 400, headers: { 'x-request-id': requestId } });

    if (action === 'promote') {
      await prisma.user.update({ where: { id }, data: { role: 'ADMIN' } });
    } else if (action === 'demote') {
      await prisma.user.update({ where: { id }, data: { role: 'USER' } });
    } else {
      return NextResponse.json({ error: 'Unknown action' }, { status: 400, headers: { 'x-request-id': requestId } });
    }
    return NextResponse.json({ ok: true }, { headers: { 'x-request-id': requestId } });
  } catch (err) {
    logServerError('admin.users.patch_failed', err, { requestId });
    return NextResponse.json({ error: 'Forbidden' }, { status: 403, headers: { 'x-request-id': requestId } });
  }
}

export async function DELETE(req: NextRequest) {
  const requestId = randomUUID();

  try {
    await requireAdmin();

    const csrfHeader = req.headers.get('x-csrf-token') || '';
    const csrfCookie = req.cookies.get('nd_csrf')?.value || '';
    if (!csrfHeader || !csrfCookie || csrfHeader !== csrfCookie) {
      return NextResponse.json({ error: 'CSRF validation failed' }, { status: 403, headers: { 'x-request-id': requestId } });
    }

    const { id } = (await req.json()) || {};
    if (!id) return NextResponse.json({ error: 'Invalid' }, { status: 400, headers: { 'x-request-id': requestId } });
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ ok: true }, { headers: { 'x-request-id': requestId } });
  } catch (err) {
    logServerError('admin.users.delete_failed', err, { requestId });
    return NextResponse.json({ error: 'Forbidden' }, { status: 403, headers: { 'x-request-id': requestId } });
  }
}
