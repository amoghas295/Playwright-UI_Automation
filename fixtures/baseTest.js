import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

export const test = base.extend({
  loggedInPage: async ({ page, context }, use) => {

    const loginPage = new LoginPage(page);

    await loginPage.navigate();
    await loginPage.loginWithGoogle(context);

    
    await use(page);
  }
});

export const expect = base.expect;