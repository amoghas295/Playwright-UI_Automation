import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage.js';

export const test = base.extend({
  loggedInPage: async ({ page, context }, use) => {
    const loginPage = new LoginPage(page);

    for (let attempt = 1; attempt <= 2; ++attempt) {
      try {
        await loginPage.navigate();
        await loginPage.loginWithGoogle(context);

        // wait until NOT on login page
        await page.waitForURL(/eazyupdates/, { timeout: 30000 });

        // ensure app has fully loaded onto the screen
        await page.waitForLoadState('networkidle');

        break;
      } catch (e) {
        if (attempt === 2) throw e;
        console.warn(`Login attempt ${attempt} failed – retrying…`);
      }
    }

    await use(page);
  },
});

export const expect = base.expect;