import { test, expect } from '../../../fixtures/baseTest';
import { TimelinePage } from '../../../pages/TimelinePage';

test('timeline draft + publish validation', async ({ loggedInPage }) => {
  const timeline = new TimelinePage(loggedInPage);

  // Step 1: go to dashboard
  await timeline.navigate();

  // Step 2: navigate via sidebar (CRITICAL)
  await timeline.goToMyTimelineViaMenu();

  // Step 3: wait for timeline
  await timeline.waitForTimelineReady();

  // Step 4: type update
  const testText = 'Test draft update';
  await timeline.addUpdate(testText);

  // Step 5: verify draft state
  await timeline.verifyDraftVisible();

  // Step 6: publish
  await timeline.publishUpdate();

  // Step 7: verify saved
  await timeline.verifyUpdateVisible(testText);
});