const {test,expect}=require("@playwright/test")
const { link }=require("node:fs")

test.use({ storageState: 'auth.json'})

test("validate navigating project error",async ({page})=> {
    await page.goto('/user/dashboard');
    await page.waitForLoadState('domcontentloaded');
    const  proj= await page.getByText('1232').first()
    await proj.click();
    // await expect(page).toHaveURL(/1232/);
    // await page.getByText('Project Details', { exact: true })
    await expect(page.locator(':text-is("Location Statistics")').first()).toBeVisible();
})