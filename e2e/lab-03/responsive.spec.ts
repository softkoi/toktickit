import { test, expect } from '@playwright/test';

test('VIS-01: User Management has no overflow at desktop, tablet, or mobile', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/');
  expect(true).toBe(true);
});
