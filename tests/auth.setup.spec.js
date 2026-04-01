import { test } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

test('save auth', async ({ page }) => {
  await page.goto('https://staging.eazyupdates.com/user/login');
  await page.pause(); // manual login

  await page.waitForLoadState('domcontentloaded');

  // confirm you're inside app 
  const url = page.url();
  console.log('FINAL URL:', url);

  await page.context().storageState({ path: 'auth.json' });
});
