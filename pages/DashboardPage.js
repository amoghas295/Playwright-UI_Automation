export class DashboardPage {
  constructor(page) {
    this.page = page;
    this.dashboardLink = page.getByRole('link', { name: /dashboard/i });
    this.profile = page.locator('.user-profile-image');
    this.logout = page.getByText('Logout');
  }

  async navigate() {
    await this.dashboardLink.waitFor({ state: 'visible' });
    await this.dashboardLink.click();
    await this.page.waitForURL(/\/user\/dashboard/);
    await this.page.waitForLoadState('networkidle');
  }

  async logoutUser() {
    await this.profile.waitFor({ state: 'visible' });
    await this.profile.click();

    await this.logout.waitFor({ state: 'visible' });
    await this.logout.click();
  }
}