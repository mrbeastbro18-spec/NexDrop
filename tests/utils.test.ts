import { describe, it, expect } from 'vitest';
import utils from '../lib/utils.js';

describe('utils', () => {
  it('safeFileName replaces unsafe chars and trims length', () => {
    const name = 'a/b\\c?d*e:<>|"'.repeat(10);
    const cleaned = utils.safeFileName(name);
    expect(cleaned).not.toContain('/');
    expect(cleaned).not.toContain('\\');
    expect(cleaned.length).toBeLessThanOrEqual(180);
  });

  it('humanSize formats sizes', () => {
    expect(utils.humanSize(512)).toBe('512 B');
    expect(utils.humanSize(2048)).toMatch(/KB$/);
    expect(utils.humanSize(5 * 1024 * 1024)).toMatch(/MB$/);
  });

  it('sha256 hashes values deterministically', async () => {
    await expect(utils.sha256('hello')).resolves.toBe(
      '2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824'
    );
  });
});
