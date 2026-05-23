import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import { env } from './env';
import utils from './utils.js';

import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  type GetObjectCommandInput
} from '@aws-sdk/client-s3';

const s3 = env.S3_ENABLED && env.S3_ACCESS_KEY && env.S3_SECRET_KEY
  ? new S3Client({
      region: env.S3_REGION,
      endpoint: env.S3_ENDPOINT || undefined,
      forcePathStyle: !!env.S3_ENDPOINT,
      credentials: {
        accessKeyId: env.S3_ACCESS_KEY,
        secretAccessKey: env.S3_SECRET_KEY
      }
    })
  : null;

export async function ensureStorage() {
  await fs.mkdir(env.STORAGE_PATH, { recursive: true });
  await fs.mkdir(env.TEMP_UPLOAD_PATH, { recursive: true });
}

export function userDir(userId: string) {
  return path.join(env.STORAGE_PATH, 'users', userId);
}

export function tempDir(fileId: string) {
  return path.join(env.TEMP_UPLOAD_PATH, fileId);
}

export function finalFilePath(userId: string, fileId: string, originalName: string) {
  return path.join(userDir(userId), `${fileId}-${utils.safeFileName(originalName)}`);
}

export async function writeChunk(fileId: string, index: number, data: ArrayBuffer) {
  const dir = tempDir(fileId);
  await fs.mkdir(dir, { recursive: true });
  const chunkPath = path.join(dir, `chunk-${String(index).padStart(6, '0')}`);
  await fs.writeFile(chunkPath, Buffer.from(data));
  return chunkPath;
}

export async function assembleChunks(fileId: string, chunkCount: number, destPath: string) {
  const dir = tempDir(fileId);
  await fs.mkdir(path.dirname(destPath), { recursive: true });
  const out = await fs.open(destPath, 'w');

  try {
    for (let i = 0; i < chunkCount; i++) {
      const chunkPath = path.join(dir, `chunk-${String(i).padStart(6, '0')}`);
      const chunk = await fs.readFile(chunkPath);
      await out.write(chunk);
    }
  } finally {
    await out.close();
  }
}

export async function cleanupChunks(fileId: string) {
  await fs.rm(tempDir(fileId), { recursive: true, force: true });
}

export async function uploadLocalToStore(localPath: string, key: string) {
  if (!env.S3_ENABLED || !s3) return key;

  const Body = fsSync.createReadStream(localPath);
  await s3.send(new PutObjectCommand({ Bucket: env.S3_BUCKET, Key: key, Body }));
  // Optionally remove local file after upload
  try { await fs.rm(localPath, { force: true }); } catch (e) {}
  return key;
}

export async function getReadableStream(storagePath: string, range?: { start?: number; end?: number }) {
  // If S3 enabled, treat storagePath as object Key
  if (env.S3_ENABLED && s3) {
    const cmdOpts: any = { Bucket: env.S3_BUCKET, Key: storagePath };
    if (range && (typeof range.start === 'number' || typeof range.end === 'number')) {
      const start = range.start ?? 0;
      const end = typeof range.end === 'number' ? range.end : '';
      cmdOpts.Range = `bytes=${start}-${end}`;
    }
    const cmd = new GetObjectCommand(cmdOpts);
    const res = await s3.send(cmd);
    // @ts-ignore
    return res.Body as any;
  }

  // Otherwise return local fs stream (support range)
  if (range && (typeof range.start === 'number' || typeof range.end === 'number')) {
    const opts: any = {};
    if (typeof range.start === 'number') opts.start = range.start;
    if (typeof range.end === 'number') opts.end = range.end;
    return fsSync.createReadStream(storagePath, opts);
  }

  return fsSync.createReadStream(storagePath);
}

export async function deleteStoredFile(storagePath: string) {
  if (env.S3_ENABLED && s3) {
    try { await s3.send(new DeleteObjectCommand({ Bucket: env.S3_BUCKET, Key: storagePath })); } catch (e) { console.error('S3 delete error', e); }
    return;
  }

  try { await fs.rm(storagePath, { force: true }); } catch (e) { }
}
