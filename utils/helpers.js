export async function waitForPageLoad(page) {
  await page.waitForLoadState('domcontentloaded');
}