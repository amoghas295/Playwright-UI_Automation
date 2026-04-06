import { test, expect } from '@playwright/test';

test.use({ storageState: 'auth.json' });

test('validate navigating project error', async ({ page }) => {
    await page.goto('/user/dashboard');
    await page.waitForLoadState('domcontentloaded');

    // Wait for a numeric code/project chip that exists on the dashboard
    const proj = page.locator('text=/\\d+/').first();
    await proj.waitFor({ state: 'visible', timeout: 15000 });
    await proj.click();

    // Verify redirection to project details or a specific statistics locator
    await expect(page.locator(':text-is("Location Statistics")').first()).toBeVisible({ timeout: 20000 });
});