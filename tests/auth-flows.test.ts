import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock utils.sha256 to return a stable value (module has a default export)
vi.mock('../lib/utils.js', () => ({
  default: {
    sha256: vi.fn(async () => 'deadbeef'),
    safeFileName: (s: string) => s,
    humanSize: (n: number) => String(n),
    nowPlusDays: (d: number) => new Date()
  }
}));

// Mock prisma to observe session/user ops
vi.mock('../lib/prisma', () => ({
  prisma: {
    session: {
      create: vi.fn(),
      deleteMany: vi.fn(),
      findUnique: vi.fn(),
      delete: vi.fn()
    },
    user: {
      findUnique: vi.fn()
    }
  }
}));

import { prisma } from '../lib/prisma';
import * as auth from '../lib/auth';
const { saveSession, revokeSession, rotateTokens, signRefreshToken } = auth;

describe('auth flows', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('saveSession creates a session with hashed token', async () => {
    await saveSession('user-1', 'refresh-token', 'device-x');
    expect(prisma.session.create).toHaveBeenCalled();
    const arg = (prisma.session.create as any).mock.calls[0][0];
    expect(arg.data.userId).toBe('user-1');
    expect(arg.data.tokenHash).toBe('deadbeef');
    expect(arg.data.deviceInfo).toBe('device-x');
  });

  it('revokeSession deletes sessions by hashed token', async () => {
    await revokeSession('refresh-token');
    expect(prisma.session.deleteMany).toHaveBeenCalledWith({ where: { tokenHash: 'deadbeef' } });
  });

  it('rotateTokens throws INVALID_SESSION when session not found', async () => {
    // Arrange: create a real refresh token and ensure session lookup returns null
    const token = await signRefreshToken({ sub: 'user-1' });
    (prisma.session.findUnique as any).mockResolvedValue(null);

    await expect(rotateTokens(token)).rejects.toThrow('INVALID_SESSION');
  });
});
