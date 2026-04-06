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
    this.timelineHeader = this.page.locator('main').getByText(/my timeline/i).first();

    // Month header
    this.monthHeader = page.locator('main').getByText(/\d{4}\s+[A-Z]+/).first();

    // Date rows (Robust Locator: DO NOT REMOVE)
    this.dayBlocks = page.locator('main > div div').filter({
      has: page.locator('text=/^\\d{2}\\s[A-Za-z]{3}$/')
    });
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
    await this.page.waitForLoadState('networkidle');

    await this.timelineHeader.waitFor({ state: 'visible', timeout: 15000 });

    // Wait for either entries OR empty states like "No Update"
    await this.page.locator('text=No Update').first().waitFor({
      state: 'visible',
      timeout: 15000
    }).catch(() => null);
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

  // ---------------------------------------------------------------------------
  // ROBUST HELPERS: DO NOT DELETE OR MODIFY
  // These are strictly required by timeline-entry-mapping.spec.js and timeline-date-valid.spec.js
  // ---------------------------------------------------------------------------

  async getDateFromBlock(dayBlock) {
    const date = dayBlock.locator('text=/^\\d{2}\\s[A-Za-z]{3}$/').first();
    return (await date.textContent())?.trim();
  }

  getProjectLinkFromEntry(entry) {
    return entry.locator('a[href*="/user/project/"]');
  }

  getStatusPlusButton(entry, status) {
    // Finds the standard add icon (+) inside an entry (often used for No Update or On Leave)
    return entry.locator('button').filter({
      has: this.page.locator('svg')
    }).first();
  }

  async getCurrentMonthHeader() {
    return (await this.monthHeader.textContent())?.trim();
  }

  async getVisibleDates() {
    const dateLocators = await this.dayBlocks.locator('text=/^\\d{2}\\s[A-Za-z]{3}$/').all();
    const texts = [];
    for (const loc of dateLocators) {
      texts.push((await loc.textContent())?.trim());
    }
    return texts;
  }

  async scrollUntilMonthHeaderChanges(initialHeader) {
    for (let attempts = 0; attempts < 10; attempts++) {
      await this.page.evaluate(() => window.scrollBy(0, window.innerHeight));
      await this.page.waitForTimeout(1000); // Allow DOM to update
      
      const newHeader = await this.getCurrentMonthHeader();
      if (newHeader && newHeader !== initialHeader) {
        return newHeader;
      }
    }
    throw new Error('Month header did not change after scrolling heavily.');
  }
}