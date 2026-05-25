import { test, expect } from '@playwright/test';

test('homepage loads and shows NexDrop branding', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/NexDrop/i);
  await expect(page.getByText('NexDrop', { exact: true })).toBeVisible();
});

test('login page is available', async ({ page }) => {
  await page.goto('/login');
  await expect(page.locator('input[name="email"]')).toBeVisible();
  await expect(page.locator('input[name="password"]')).toBeVisible();
});
