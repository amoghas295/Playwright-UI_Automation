export class TimelinePage {
  constructor(page) {
    this.page = page;

    // Sidebar navigation
    this.timelineLink = page.getByTestId('timeline');

    // Editor
    this.editor = page.locator('div[contenteditable="true"]');

    // Draft chip
    this.draftChip = page.getByText(/draft/i);

    // Publish button
    this.publishBtn = page.getByRole('button', { name: /publish/i });

    // Timeline header (page loaded signal)
    this.timelineHeader = page.locator('main').getByText('My Timeline');
  }

  async navigate() {
    await this.page.goto('/user/dashboard');
    await this.page.waitForLoadState('networkidle');
  }

  // IMPORTANT: always use sidebar (fix dynamic URL issue)
  async goToMyTimelineViaMenu() {
    await this.timelineLink.waitFor({ state: 'visible', timeout: 15000 });
    await this.timelineLink.click();

    await this.page.waitForURL(/\/user\/timeline/, { timeout: 30000 });
  }

  async waitForTimelineReady() {
  await this.timelineHeader.waitFor({ state: 'visible', timeout: 30000 });
}

  async addUpdate(text) {
    await this.editor.waitFor({ state: 'visible' });
    await this.editor.click();
    await this.editor.fill(text);
  }

  async verifyDraftVisible() {
    await this.draftChip.waitFor({ state: 'visible', timeout: 7000 });
  }

  async publishUpdate() {
    await this.publishBtn.waitFor({ state: 'visible' });
    await this.publishBtn.click();
  }

  async verifyUpdateVisible(text) {
    await this.page.getByText(text).waitFor({ state: 'visible', timeout: 10000 });
  }
}