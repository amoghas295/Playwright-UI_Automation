export class TimelinePage {
  constructor(page) {
    this.page = page;

    // Sidebar navigation
    this.timelineLink = page.getByTestId('timeline');

    // Editor (TipTap / contenteditable)
    this.editor = page.locator('div[contenteditable="true"]');

    // Month header
    this.monthHeader = page.locator('main').getByText(/\d{4}\s+[A-Z]+/).first();

    // Date rows (REAL FIX)
    this.dayBlocks = page.locator('main > div div').filter({
      has: page.locator('text=/^\\d{2}\\s[A-Za-z]{3}$/')
    });
  }

  //  DO NOT USE DIRECT URL
  // async navigate() { ... }  remove usage

  //  Use sidebar navigation (dynamic user-safe)
  async goToMyTimelineViaMenu() {
    await this.timelineLink.waitFor({ state: 'visible', timeout: 10000 });
    await this.timelineLink.click();

    await this.page.waitForURL(/\/user\/timeline/);
    await this.page.waitForLoadState('networkidle');
  }

  async waitForTimelineReady() {
    await this.page.waitForLoadState('networkidle');

    await this.monthHeader.waitFor({
      state: 'visible',
      timeout: 30000
    });
  }

  // ----------------------------
  // REUSABLE UPDATE FUNCTIONS
  // ----------------------------

  async enterUpdate(text) {
    await this.editor.waitFor({ state: 'visible', timeout: 15000 });
    await this.editor.click();
    await this.editor.fill(text);
  }

  async publishUpdate() {
    await this.page.getByRole('button', { name: /publish/i }).click();
  }

  async addAndPublishUpdate(text) {
    await this.enterUpdate(text);
    await this.publishUpdate();
  }

  // ----------------------------
  // DATA HELPERS (FIXED)
  // ----------------------------

  async getDateFromBlock(dayBlock) {
    const date = dayBlock.locator('text=/^\\d{2}\\s[A-Za-z]{3}$/').first();
    return (await date.textContent())?.trim();
  }

  async getEntriesForDayBlock(dayBlock) {
    return dayBlock.locator('div').filter({
      hasText: /No Update|On Leave|Weekend|Not Updated|rabbit|Testing/
    });
  }

  getProjectLinkFromEntry(entry) {
    return entry.locator('a[href*="/user/project/"]');
  }

  getAddButtonFromEntry(entry) {
    return entry.locator('button').filter({
      has: this.page.locator('svg')
    }).first();
  }
}