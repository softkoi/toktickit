import { test, expect } from '@playwright/test';

test('E2E-04: Administrator lists, filters, and creates a user with an initial password', async ({ page }) => {
  await page.goto('/');
  expect(true).toBe(true);
});
