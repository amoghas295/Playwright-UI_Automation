const {test,expect}=require("@playwright/test");
const { link } = require("node:fs");

test.use({ storageState: 'auth.json'})

test('Dashboard loads after login', async ({page})=> {

  await page.goto('/');

 // Validate logged-in state
  await expect(page).toHaveURL(/staging.eazyupdates.com/);

  // Strong validation (IMPORTANT)
  expect(page.getByText('Dashboard'));

  

});

test('my timeline is validated', async ({page})=>{
  await page.goto('/user/timeline');
  
  //  Ensure page fully loads
  await page.waitForLoadState('domcontentloaded');

  // Debug once if needed
  // await page.pause();

  const timeline = page.locator("a[data-testid='timeline']");

  // Wait until element actually appears
  await timeline.waitFor({ state: 'visible' });

  // Click timeline
  await timeline.click();

  await expect(page).toHaveURL(/timeline/);

  // Correct UI validation (fixed)
  await expect(page.locator('main').getByText('My Timeline')).toBeVisible();
})

test('validate logout', async({page})=>{
  await page.goto("/user/dashboard");
  await page.waitForLoadState('domcontentloaded');
  // expect(page.getByText('Dashboard'));
  //now we check for logout button
  const profile = page.locator('.user-profile-image');
  await profile.waitFor({ state: 'visible' });

  // Step 2: Open dropdown
  await profile.click(); // use click instead of hover

  // Step 3: Click logout from dropdown
  const logout = page.getByText('Logout');
  await expect(logout).toBeVisible();

  await logout.click();

  // Step 4: Validate logout
  await expect(page).toHaveURL(/login/);
})
