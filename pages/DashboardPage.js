export class DashboardPage {
  constructor(page) {
    this.page = page;
    this.profile = page.locator('.user-profile-image');
    this.logout = page.getByText('Logout');
  }

  async logoutUser() {
    await this.profile.waitFor();
    await this.profile.click();

    await this.logout.waitFor();
    await this.logout.click();
  }
}