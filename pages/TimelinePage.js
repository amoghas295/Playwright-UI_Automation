export class TimelinePage {
  constructor(page) {
    this.page = page;
    // Updated to use a robust locator for the sidebar link
    this.timelineLink = page.getByRole('link', { name: /my timeline/i });
    // Prefer role-based locator; fall back to CSS if no textbox role is present
    this.editor = page.getByRole('textbox').or(page.locator('div[contenteditable="true"]'));
  }

  async navigate() {
    // Navigate via UI click exactly as a user would
    await this.timelineLink.waitFor({ state: 'visible' });
    await this.timelineLink.click();

    // Wait for both URL change and network to settle so async content loads
    await this.page.waitForURL(/\/user\/timeline/);
    await this.page.waitForLoadState('networkidle');
  }

  async waitForTimelineReady() {
    await this.editor.waitFor({ state: 'visible', timeout: 15000 });
  }

  async addUpdate(text) {
    await this.editor.click();
    await this.editor.fill(text);
  }
}
