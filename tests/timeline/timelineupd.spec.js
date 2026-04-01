import { test, expect } from '../../fixtures/baseTest';
import { TimelinePage } from '../../pages/TimelinePage';

test('timeline update column validation', async ({ loggedInPage }) => {
  const timeline = new TimelinePage(loggedInPage);

  await timeline.navigate();
  await timeline.waitForTimelineReady();

  await timeline.addUpdate('Test update');

  await expect(loggedInPage.getByRole('textbox').or(loggedInPage.locator('div[contenteditable="true"]')))
    .toContainText('Test update');
});