import { test } from '../fixtures/baseTest.js';

test('dump dashboard', async ({ loggedInPage }) => {
  const fs = require('fs');
  await loggedInPage.goto('/user/dashboard');
  await loggedInPage.waitForLoadState('networkidle');
  await loggedInPage.waitForTimeout(5000);
  const html = await loggedInPage.content();
  fs.writeFileSync('dashboard.html', html);
});
