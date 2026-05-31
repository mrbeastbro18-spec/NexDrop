import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock utils default export
vi.mock('../lib/utils.js', () => ({
  default: {
    sha256: vi.fn(async () => 'deadbeef'),
    safeFileName: (s: string) => s,
    humanSize: (n: number) => String(n),
    nowPlusDays: (d: number) => new Date()
  }
}));

// Mock prisma
vi.mock('../lib/prisma', () => ({
  prisma: {
    session: {
      findUnique: vi.fn(),
      delete: vi.fn(),
      create: vi.fn()
    },
    user: {
      findUnique: vi.fn()
    }
  }
}));

import { prisma } from '../lib/prisma';
import { rotateTokens, signRefreshToken, signAccessToken } from '../lib/auth';

describe('rotateTokens success', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rotateTokens creates new session and returns tokens', async () => {
    // Arrange: existing session present
    (prisma.session.findUnique as any).mockResolvedValue({ id: 's1', userId: 'user-1', tokenHash: 'deadbeef' });
    (prisma.user.findUnique as any).mockResolvedValue({ id: 'user-1', role: 'USER' });

    const oldToken = await signRefreshToken({ sub: 'user-1' });
    const result = await rotateTokens(oldToken);

    expect(result).toHaveProperty('accessToken');
    expect(result).toHaveProperty('refreshToken');
    expect(prisma.session.create).toHaveBeenCalled();
  });

  it('signAccessToken and signRefreshToken return strings', async () => {
    const at = await signAccessToken({ sub: 'u1', role: 'USER' } as any);
    const rt = await signRefreshToken({ sub: 'u1' } as any);
    expect(typeof at).toBe('string');
    expect(typeof rt).toBe('string');
  });
});
