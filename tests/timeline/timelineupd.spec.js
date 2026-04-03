import { test, expect } from '../../fixtures/baseTest';
import { TimelinePage } from '../../pages/TimelinePage';

test('timeline update column validation', async ({ loggedInPage }) => {
  const timeline = new TimelinePage(loggedInPage);

  // Start after login → dashboard
  await loggedInPage.waitForLoadState('networkidle');

  //  Navigate via sidebar (CRITICAL FIX)
  await timeline.goToMyTimelineViaMenu();

  //  Wait for timeline to load properly
  await timeline.waitForTimelineReady();

  // Reusable update flow
  await timeline.addAndPublishUpdate('Test update');

  // Validate
  await expect(loggedInPage.locator('body')).toContainText('Test update');
});