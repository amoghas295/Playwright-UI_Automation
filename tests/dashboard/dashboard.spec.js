import { test, expect } from '../../fixtures/baseTest';
import { DashboardPage } from '../../pages/DashboardPage';

test('logout validation', async ({ loggedInPage }) => {

  const dashboard = new DashboardPage(loggedInPage);

  await dashboard.navigate();

  await dashboard.logoutUser();

  await expect(loggedInPage).toHaveURL(/login/);

});