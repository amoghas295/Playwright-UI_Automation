import { test } from '../fixtures/baseTest.js';

test('dump html', async ({ loggedInPage }) => {
  const fs = require('fs');
  await loggedInPage.goto('/user/dashboard');
  await loggedInPage.waitForLoadState('networkidle');
  await loggedInPage.getByTestId('timeline').click();
  await loggedInPage.waitForURL(/\/user\/timeline/);
  await loggedInPage.waitForLoadState('networkidle');
  await loggedInPage.waitForTimeout(5000);
  const html = await loggedInPage.content();
  fs.writeFileSync('timeline.html', html);
});
