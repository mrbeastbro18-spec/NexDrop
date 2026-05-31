import { describe, expect, it } from 'vitest';
import { isOfficeZipMime, isTextLikeMime, mimeTypeSchema } from '../lib/validation';
import { sniffBasicMime } from '../lib/file-signature';

describe('file type support', () => {
  it('accepts broader safe document and text MIME types', () => {
    expect(mimeTypeSchema.safeParse('text/markdown').success).toBe(true);
    expect(mimeTypeSchema.safeParse('application/rtf').success).toBe(true);
    expect(mimeTypeSchema.safeParse('application/vnd.openxmlformats-officedocument.wordprocessingml.document').success).toBe(true);
    expect(mimeTypeSchema.safeParse('video/quicktime').success).toBe(true);
  });

  it('identifies text-like and office-zip MIME families', () => {
    expect(isTextLikeMime('text/markdown')).toBe(true);
    expect(isTextLikeMime('application/xml')).toBe(true);
    expect(isOfficeZipMime('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')).toBe(true);
    expect(isOfficeZipMime('application/zip')).toBe(false);
  });

  it('sniffs additional safe media signatures', () => {
    expect(sniffBasicMime(new Uint8Array([0x4f, 0x67, 0x67, 0x53]))).toBe('audio/ogg');
    expect(sniffBasicMime(new Uint8Array([0x66, 0x4c, 0x61, 0x43]))).toBe('audio/flac');
  });
});