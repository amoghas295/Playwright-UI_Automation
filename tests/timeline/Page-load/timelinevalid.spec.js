import { test, expect } from '../../../fixtures/baseTest';
import { TimelinePage } from '../../../pages/TimelinePage';

test('timeline validation', async ({ loggedInPage }) => {

  const timeline = new TimelinePage(loggedInPage);

  await timeline.navigate();
  await timeline.waitForTimelineReady();
  
});