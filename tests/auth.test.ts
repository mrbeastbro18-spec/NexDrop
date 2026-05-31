import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock prisma to observe session deletion
vi.mock('../lib/prisma', () => {
  return {
    prisma: {
      session: {
        deleteMany: vi.fn()
      }
    }
  };
});

import { prisma } from '../lib/prisma';
import { revokeAllUserSessions } from '../lib/auth';

describe('auth sessions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('revokeAllUserSessions calls prisma.session.deleteMany with userId', async () => {
    await revokeAllUserSessions('user-123');
    expect(prisma.session.deleteMany).toHaveBeenCalledWith({ where: { userId: 'user-123' } });
  });
});
