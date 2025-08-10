import { test, expect } from '@playwright/test';

test.describe('user flow', () => {
  test.skip(!process.env.BASE_URL, 'Requires BASE_URL environment');

  test('login -> post -> edit -> unpublish -> accept invite', async ({ page }) => {
    const base = process.env.BASE_URL!;
    await page.goto(base);
    // Login
    await page.fill('input[name="email"]', 'user@example.com');
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');

    // Create post
    await page.click('text=New Post');
    await page.fill('textarea[name="body"]', 'hello world');
    await page.click('text=Publish');

    // Edit post
    await page.click('text=Edit');
    await page.fill('textarea[name="body"]', 'updated');
    await page.click('text=Save');

    // Unpublish
    await page.click('text=Unpublish');

    // Accept invitation
    await page.goto(base + '/invites');
    await page.click('text=Accept');

    await expect(page.locator('text=Invitation accepted')).toBeVisible();
  });
});
