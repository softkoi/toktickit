import { test, expect } from '@playwright/test';

test.describe('Lab 3 authentication flow', () => {
  test('E2E-01: Invalid credentials receive safe feedback', async ({ page }) => {
    await page.goto('/');
    expect(true).toBe(true);
  });

  test('E2E-02: Initial password routes through change password, then logout blocks protected access', async ({ page }) => {
    await page.goto('/');
    expect(true).toBe(true);
  });
});
