import { test, expect } from '../../../fixtures/baseTest';
import { TimelinePage } from '../../../pages/TimelinePage';

// Helper function to parse a date string like "02 Apr" and a header like "2026 APRIL" into a Date object
function parseTimelineDate(dateStr, monthHeader) {
  // Extract year from header, e.g., "2026 APRIL" -> "2026"
  const yearMatch = monthHeader.match(/\d{4}/);
  const year = yearMatch ? yearMatch[0] : new Date().getFullYear();
  return new Date(`${dateStr} ${year}`);
}

// Helper to check if an array of Date objects is in descending order
function isDescending(dates) {
  for (let i = 0; i < dates.length - 1; i++) {
    if (dates[i] < dates[i + 1]) {
      return false;
    }
  }
  return true;
}

test('timeline Date order and scrolling validation', async ({ loggedInPage }) => {
  const timeline = new TimelinePage(loggedInPage);

  // 1. Validate Timeline page loads successfully
  await timeline.navigate();
  await timeline.waitForTimelineReady();

  // Get initial month header
  const initialHeader = await timeline.getCurrentMonthHeader();
  expect(initialHeader).toBeTruthy();
  // Ensure the header displays year and month (e.g. "2026 APRIL")
  expect(initialHeader).toMatch(/\d{4}\s+[A-Za-z]+/); 

  // 2. Ensure entries are correctly mapped and displayed in descending order
  const initialDatesText = await timeline.getVisibleDates();
  expect(initialDatesText.length).toBeGreaterThan(0);

  const initialDates = initialDatesText.map(d => parseTimelineDate(d, initialHeader));
  expect(isDescending(initialDates)).toBe(true);

  // 3. Scroll down to trigger loading the previous month
  const previousMonthHeader = await timeline.scrollUntilMonthHeaderChanges(initialHeader);
  
  // Verify the header updated successfully after scrolling
  expect(previousMonthHeader).toBeTruthy();
  expect(previousMonthHeader).not.toEqual(initialHeader);

  // Verify the new dates for the new month are also in descending order
  const newDatesText = await timeline.getVisibleDates();
  expect(newDatesText.length).toBeGreaterThan(0);
  
  const newDates = newDatesText.map(d => parseTimelineDate(d, previousMonthHeader));
  expect(isDescending(newDates)).toBe(true);
});
