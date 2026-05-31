import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logServerError } from '@/lib/logger';
import { BOOTSTRAP_ADMIN_SUBJECT } from '@/lib/admin-bootstrap';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const requestId = randomUUID();

  try {
    const user = await requireAdmin();
    if ((user as any).bootstrap || user.id === BOOTSTRAP_ADMIN_SUBJECT) {
      return NextResponse.json(
        { error: 'User management is unavailable in bootstrap admin mode', bootstrap: true },
        { status: 503, headers: { 'x-request-id': requestId } }
      );
    }
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
    const user = await requireAdmin();
    if ((user as any).bootstrap || user.id === BOOTSTRAP_ADMIN_SUBJECT) {
      return NextResponse.json(
        { error: 'User management is unavailable in bootstrap admin mode', bootstrap: true },
        { status: 503, headers: { 'x-request-id': requestId } }
      );
    }

    // CSRF guard for state-changing admin actions
    const csrfHeader = req.headers.get('x-csrf-token') || '';
    const csrfCookie = req.cookies.get('nd_csrf')?.value || '';
    if (!csrfHeader || !csrfCookie || csrfHeader !== csrfCookie) {
      return NextResponse.json({ error: 'CSRF validation failed' }, { status: 403, headers: { 'x-request-id': requestId } });
    }

    const body = await req.json();
    const patchSchema = z.object({ id: z.string().uuid('Invalid user ID'), action: z.enum(['promote', 'demote']) });
    const validation = patchSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.issues[0]?.message || 'Invalid' }, { status: 400, headers: { 'x-request-id': requestId } });
    }

    const { id, action } = validation.data;
    if (action === 'promote') {
      await prisma.user.update({ where: { id }, data: { role: 'ADMIN' } });
    } else if (action === 'demote') {
      await prisma.user.update({ where: { id }, data: { role: 'USER' } });
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
    const user = await requireAdmin();
    if ((user as any).bootstrap || user.id === BOOTSTRAP_ADMIN_SUBJECT) {
      return NextResponse.json(
        { error: 'User management is unavailable in bootstrap admin mode', bootstrap: true },
        { status: 503, headers: { 'x-request-id': requestId } }
      );
    }

    const csrfHeader = req.headers.get('x-csrf-token') || '';
    const csrfCookie = req.cookies.get('nd_csrf')?.value || '';
    if (!csrfHeader || !csrfCookie || csrfHeader !== csrfCookie) {
      return NextResponse.json({ error: 'CSRF validation failed' }, { status: 403, headers: { 'x-request-id': requestId } });
    }

    const body = await req.json().catch(() => ({}));
    const deleteSchema = z.object({ id: z.string().uuid('Invalid user ID') });
    const validation = deleteSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.issues[0]?.message || 'Invalid' }, { status: 400, headers: { 'x-request-id': requestId } });
    }
    const { id } = validation.data;
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ ok: true }, { headers: { 'x-request-id': requestId } });
  } catch (err) {
    logServerError('admin.users.delete_failed', err, { requestId });
    return NextResponse.json({ error: 'Forbidden' }, { status: 403, headers: { 'x-request-id': requestId } });
  }
}
