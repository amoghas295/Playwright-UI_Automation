// global-setup.js — runs ONCE before all tests.
// Logs in via Google OAuth and saves the session to .auth/session.json
// so individual tests can reuse it without re-authenticating each time.
// This avoids bot-detection throttling from repeated Google popups.

import { chromium } from '@playwright/test';
import { ENV } from './config/env.js';

export default async function globalSetup() {
  const browser = await chromium.launch({
    headless: false, // OAuth popups require non-headless
    args: ['--disable-blink-features=AutomationControlled'],
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto(`${ENV.BASE_URL}/user/login`);

  // Click the Google login button (inside iframe)
  const googleBtn = page.frameLocator('iframe').getByRole('button', { name: /google/i });
  await googleBtn.waitFor({ state: 'visible', timeout: 15000 });

  const [popup] = await Promise.all([
    context.waitForEvent('page'),
    googleBtn.click(),
  ]);

  await popup.waitForLoadState();

  // Fill credentials in the OAuth popup
  await popup.getByLabel(/email|phone/i).fill(ENV.EMAIL);
  await popup.getByRole('button', { name: /next/i }).click();

  const passwordInput = popup.getByLabel(/enter your password/i);
  await passwordInput.waitFor({ state: 'visible' });
  await passwordInput.click();
  await passwordInput.fill(ENV.PASSWORD);
  await popup.getByRole('button', { name: /next/i }).click();

  await popup.waitForEvent('close');
  await page.waitForURL(/dashboard|timeline/);

  // Save the authenticated session — all tests will reuse this
  await context.storageState({ path: '.auth/session.json' });

  await browser.close();
}
