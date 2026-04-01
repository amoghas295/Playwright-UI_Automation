import { test, expect } from '../../fixtures/baseTest';
import { DashboardPage } from '../../pages/DashboardPage';

test('logout validation', async ({ loggedInPage }) => {

  const dashboard = new DashboardPage(loggedInPage);

  await loggedInPage.goto('/user/dashboard');

  await dashboard.logoutUser();

  await expect(loggedInPage).toHaveURL(/login/);

});