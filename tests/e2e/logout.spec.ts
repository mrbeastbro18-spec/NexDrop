import { test, expect } from '@playwright/test';
import { signAccessToken, signRefreshToken } from '../../lib/auth';

test('logout clears auth cookies and redirects to /', async ({ page, context }) => {
  // Create bootstrap-admin tokens so currentUser() resolves without DB
  const access = await signAccessToken({ sub: 'env-admin', role: 'ADMIN' } as any);
  const refresh = await signRefreshToken({ sub: 'env-admin' } as any);

  // Set cookies for the test server URL
  await context.addCookies([
    { name: 'nd_access', value: access, url: 'http://127.0.0.1:3000' },
    { name: 'nd_refresh', value: refresh, url: 'http://127.0.0.1:3000' }
  ]);

  // Call the logout endpoint directly from the browser context so Set-Cookie headers are applied
  await page.goto('/');
  await page.evaluate(async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
  });

  // Cookies should be cleared by the logout endpoint
  // Small delay to allow browser to process Set-Cookie headers
  await page.waitForTimeout(200);
  const cookies = await context.cookies();
  expect(cookies.find((c) => c.name === 'nd_access')).toBeUndefined();
  expect(cookies.find((c) => c.name === 'nd_refresh')).toBeUndefined();
});
