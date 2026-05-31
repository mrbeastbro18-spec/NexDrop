import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { fileIdSchema } from '@/lib/validation';
import { deleteStoredFile } from '@/lib/storage';
import fs from 'fs/promises';

export const runtime = 'nodejs';

export async function DELETE(req: NextRequest, ctx: any) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // CSRF protection: double-submit cookie pattern
  const csrfHeader = req.headers.get('x-csrf-token') || '';
  const csrfCookie = req.cookies.get('nd_csrf')?.value || '';
  if (!csrfHeader || !csrfCookie || csrfHeader !== csrfCookie) {
    return NextResponse.json({ error: 'CSRF validation failed' }, { status: 403 });
  }

  try {
    const params = await (ctx?.params ?? {});
    const fileId = String(params?.id || '');

    // Validate file ID format
    const validation = fileIdSchema.safeParse(fileId);
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid file ID' }, { status: 400 });
    }

    // Get file and verify ownership
    const file = await prisma.file.findFirst({
      where: { id: fileId, userId: user.id },
      include: { shareLink: true, uploadChunks: true }
    });

    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Delete physical files (soft delete: mark as deleted, or hard delete)
    // Option 1: Hard delete - remove from disk immediately
    try {
      // Delete main file
      if (file.storagePath && file.storagePath.length > 0) {
        await deleteStoredFile(file.storagePath);
      }

      // Delete orphaned chunks if any
      if (file.uploadChunks) {
        for (const chunk of file.uploadChunks) {
          if (chunk && chunk.chunkPath) {
            await fs.unlink(chunk.chunkPath).catch(() => {});
          }
        }
      }
    } catch (error) {
      console.error('File system cleanup error:', error);
      // Continue with DB deletion even if filesystem cleanup fails
    }

    // Decrement user storage quota
    const fileSizeGB = Number(file.size) / (1024 * 1024 * 1024);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        storageUsed: {
          decrement: Number(file.size)
        }
      }
    });

    // Delete from database (cascade will delete chunks and shares)
    await prisma.file.delete({
      where: { id: fileId }
    });

    // Log the action (optional analytics)
    try {
      await prisma.analyticsEvent.create({
        data: {
          userId: user.id,
          eventType: 'FILE_DELETED',
          metadata: {
            fileId,
            filename: file.originalName,
            fileSize: file.size.toString()
          }
        }
      });
    } catch (error) {
      console.error('Analytics logging error:', error);
    }

    return NextResponse.json({
      ok: true,
      message: 'File deleted successfully',
      freedStorage: Number(file.size)
    });
  } catch (error) {
    console.error('Delete file error:', error);
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    );
  }
}
