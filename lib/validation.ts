import { z } from 'zod';

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024 * 1024;
const MAX_CHUNK_SIZE_BYTES = 5 * 1024 * 1024;
const ARCHIVE_MIME_TYPES = [
  'application/zip',
  'application/x-rar-compressed',
  'application/x-7z-compressed',
  'application/x-tar',
  'application/gzip'
];

const TEXT_LIKE_MIME_TYPES = [
  'text/plain',
  'text/csv',
  'text/markdown',
  'text/xml',
  'application/xml',
  'application/json',
  'application/rtf'
];

const OFFICE_ZIP_MIME_TYPES = [
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.oasis.opendocument.text',
  'application/vnd.oasis.opendocument.spreadsheet',
  'application/vnd.oasis.opendocument.presentation'
];

const safeNamePattern = /^[^/\\\0\r\n\t]{1,180}$/;

// Auth schemas
export const emailSchema = z.string().trim().email('Invalid email address').toLowerCase();

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[!@#$%^&*]/, 'Password must contain at least one special character (!@#$%^&*)');

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  fullName: z.string().trim().min(2, 'Full name too short').max(100, 'Full name too long')
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password required')
});

export const forgotPasswordSchema = z.object({
  email: emailSchema
});

export const resetPasswordSchema = z.object({
  token: z.string().uuid('Invalid token format'),
  password: passwordSchema
});

export const safeFileNameSchema = z
  .string()
  .trim()
  .min(1, 'Filename required')
  .max(180, 'Filename too long')
  .refine((name) => safeNamePattern.test(name) && !name.includes('..'), 'Invalid filename');

// File schemas
export const fileIdSchema = z.string().uuid('Invalid file ID');

export const shareTokenSchema = z.string().regex(/^[a-f0-9]{32}$/i, 'Invalid share token');

export const uploadChunkSchema = z.object({
  fileId: fileIdSchema,
  chunkIndex: z.number().int().min(0, 'Chunk index must be non-negative'),
  totalChunks: z.number().int().min(1, 'Total chunks must be at least 1').max(10000, 'Too many chunks'),
  chunkSize: z.number().int().min(1, 'Chunk size required').max(MAX_CHUNK_SIZE_BYTES, 'Chunk too large (max 5MB)'),
  totalSize: z.number().int().min(1, 'Total size required').max(MAX_FILE_SIZE_BYTES, 'File too large (max 10GB)')
});

// additional sanity checks for chunk uploads can be applied at runtime

// Allowed MIME types for security
const ALLOWED_MIMES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'text/plain',
  'text/csv',
  'text/markdown',
  'text/xml',
  'application/xml',
  'application/rtf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.oasis.opendocument.text',
  'application/vnd.oasis.opendocument.spreadsheet',
  'application/vnd.oasis.opendocument.presentation',
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'video/x-matroska',
  'audio/mpeg',
  'audio/wav',
  'audio/ogg',
  'audio/flac',
  'application/json'
];

export const mimeTypeSchema = z
  .string()
  .refine(
    (mime) => ALLOWED_MIMES.includes(mime),
    `Unsupported file type: ${ALLOWED_MIMES.join(', ')}`
  );

export const safeUploadMimeTypeSchema = mimeTypeSchema.refine(
  (mime) => !ARCHIVE_MIME_TYPES.includes(mime),
  'Archive uploads are disabled for security'
);

export function isTextLikeMime(mime: string): boolean {
  return TEXT_LIKE_MIME_TYPES.includes(mime);
}

export function isOfficeZipMime(mime: string): boolean {
  return OFFICE_ZIP_MIME_TYPES.includes(mime);
}

export const fileMetadataSchema = z.object({
  originalName: safeFileNameSchema,
  mimeType: safeUploadMimeTypeSchema,
  totalSize: z.number().int().min(1).max(MAX_FILE_SIZE_BYTES, 'File too large')
});

export const uploadInitSchema = z.object({
  fileId: fileIdSchema,
  fileName: safeFileNameSchema,
  mimeType: safeUploadMimeTypeSchema,
  chunkIndex: z.number().int().min(0),
  totalChunks: z.number().int().min(1).max(5000),
  totalSize: z.number().int().min(1).max(MAX_FILE_SIZE_BYTES)
}).refine(
  ({ chunkIndex, totalChunks }) => chunkIndex < totalChunks,
  { message: 'Chunk index must be smaller than total chunks' }
);

// Ensure the announced totalSize is feasible given chunk count and max chunk size
export const uploadInitSanity = uploadInitSchema.refine(
  ({ totalSize, totalChunks }) => BigInt(totalSize) <= BigInt(totalChunks) * BigInt(MAX_CHUNK_SIZE_BYTES),
  { message: 'Total size exceeds allowed capacity from total chunks and max chunk size' }
);

// Share link schemas
export const createShareSchema = z.object({
  fileId: fileIdSchema,
  expiresInDays: z.number().int().min(1).max(365, 'Expiry must be 1-365 days').optional().default(7),
  password: z.string().trim().min(8, 'Password too short').max(128).optional().nullable(),
  maxDownloads: z.number().int().min(1).max(1000000).optional().nullable()
}).superRefine((value, ctx) => {
    if (value.maxDownloads !== null && value.maxDownloads !== undefined && value.maxDownloads < 1) {
      ctx.addIssue({ code: 'custom', message: 'Max downloads must be at least 1', path: ['maxDownloads'] });
    }
    if (value.password !== null && value.password !== undefined && typeof value.password === 'string') {
      if (value.password.length < 8) {
        ctx.addIssue({ code: 'custom', message: 'Password too short', path: ['password'] });
      }
    }
});

export const downloadShareSchema = z.object({
  password: z.string().trim().max(128).optional()
});

// Admin schemas
export const updateStorageQuotaSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  quotaGB: z.number().int().min(1).max(1000, 'Quota too large')
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(100).default(20)
});

export const searchPaginationSchema = z.object({
  q: z.string().trim().max(200).default(''),
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(50).default(10)
});

export type Register = z.infer<typeof registerSchema>;
export type Login = z.infer<typeof loginSchema>;
export type ForgotPassword = z.infer<typeof forgotPasswordSchema>;
export type ResetPassword = z.infer<typeof resetPasswordSchema>;
export type UploadChunk = z.infer<typeof uploadChunkSchema>;
export type FileMetadata = z.infer<typeof fileMetadataSchema>;
export type CreateShare = z.infer<typeof createShareSchema>;
export type DownloadShare = z.infer<typeof downloadShareSchema>;
export type UpdateStorageQuota = z.infer<typeof updateStorageQuotaSchema>;
export type UploadInit = z.infer<typeof uploadInitSchema>;
export type Pagination = z.infer<typeof paginationSchema>;
export type SearchPagination = z.infer<typeof searchPaginationSchema>;
