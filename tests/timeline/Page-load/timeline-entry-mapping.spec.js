import { test, expect } from '../../../fixtures/baseTest';
import { TimelinePage } from '../../../pages/TimelinePage';

// ─── Force serial execution — prevents 3 browsers opening simultaneously ────
test.describe.configure({ mode: 'serial' });

// ─── Config ─────────────────────────────────────────────────────────────────
// Staging allows backdated entries up to 12 days; production only allows 4.
const isStaging = (process.env.BASE_URL || '').includes('staging');
const BACKDATE_LIMIT = isStaging ? 12 : 4;

// ─── Helpers ────────────────────────────────────────────────────────────────

function getDaysDifference(date1, date2) {
  const d1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
  const d2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());
  return Math.round(Math.abs(d2 - d1) / (1000 * 60 * 60 * 24));
}

function parseDate(dateStr) {
  const year = new Date().getFullYear();
  const parsed = new Date(`${dateStr} ${year}`);
  if (isNaN(parsed.getTime())) return null;
  return parsed;
}

// ─── Setup ───────────────────────────────────────────────────────────────────
test.setTimeout(180_000);
test.beforeEach(async ({ loggedInPage }) => {
  const timeline = new TimelinePage(loggedInPage);
  await timeline.navigate();          // now uses the robust navigate()
  await timeline.waitForTimelineReady();
});

// ─── Case 1: Project chip in a completed update — hoverable & redirects ─────
// Project chips are cursor-pointer divs with an img (project icon) + project name.
// They navigate via JS routing to /user/project/<name>.

test('Case 1 - Entry with existing update: project chip is hoverable and redirects', async ({ loggedInPage }) => {
  const timeline = new TimelinePage(loggedInPage);

  let projectChip = null;

  // Try visible blocks first, then scroll down to find older entries with project updates
  for (let attempt = 0; attempt < 5; attempt++) {
    const allBlocks = await timeline.dayBlocks.all();

    for (const block of allBlocks) {
      const candidates = timeline.getProjectLinkFromEntry(block);
      if (await candidates.count() > 0) {
        projectChip = candidates.first();
        break;
      }
    }

    if (projectChip) break;

    // Scroll down to load more entries
    await loggedInPage.evaluate(() => window.scrollBy(0, window.innerHeight));
    await loggedInPage.waitForTimeout(1500);
  }

  if (!projectChip) {
    console.warn('No project chip found after scrolling — skipping test');
    return;
  }

  // Hover — confirms it renders as interactive
  await projectChip.hover();
  await expect(projectChip).toBeVisible();

  // Click and confirm JS-routing navigates to the project page
  await Promise.all([
    loggedInPage.waitForURL(/\/user\/project\//, { timeout: 10000 }),
    projectChip.click()
  ]);
});

// ─── Case 2: "No Update" — plus button respects 4-day backdating rule ───────

test(`Case 2 - No Update entry: plus button respects ${BACKDATE_LIMIT}-day backdating rule`, async ({ loggedInPage }) => {
  const timeline = new TimelinePage(loggedInPage);
  const today = new Date();

  const allBlocks = await timeline.dayBlocks.all();

  let recentNoUpdateBlock = null;
  let oldNoUpdateBlock = null;

  for (const block of allBlocks) {
    const text = await block.textContent();
    if (!text.includes('No Update')) continue;

    const dateText = await timeline.getDateFromBlock(block);
    if (!dateText) continue;
    const parsedDate = parseDate(dateText);
    if (!parsedDate) continue;
    const daysDiff = getDaysDifference(parsedDate, today);

    if (daysDiff <= BACKDATE_LIMIT && !recentNoUpdateBlock) {
      recentNoUpdateBlock = block;
    } else if (daysDiff > BACKDATE_LIMIT && !oldNoUpdateBlock) {
      oldNoUpdateBlock = block;
    }
    if (recentNoUpdateBlock && oldNoUpdateBlock) break;
  }

  // ── Within BACKDATE_LIMIT days: plus button must be visible and open editor ──
  if (recentNoUpdateBlock) {
    await recentNoUpdateBlock.hover();
    // Use getStatusPlusButton to target the EXACT "No Update" + button
    // (avoids hitting the "On Leave" button if the same day has both)
    const plusBtn = timeline.getStatusPlusButton(recentNoUpdateBlock, 'No Update');
    await expect(plusBtn).toBeVisible({ timeout: 5000 });

    await plusBtn.click();

    // Cancel button ONLY appears for past-day editors (not today's default editor)
    const cancelBtn = loggedInPage.getByRole('button', { name: /cancel/i });
    await expect(cancelBtn.first()).toBeVisible({ timeout: 6000 });

    // Dismiss editor
    await cancelBtn.first().click();
  } else {
    console.warn(`No "No Update" entry within ${BACKDATE_LIMIT} days found — skipping`);
  }

  // ── Older than BACKDATE_LIMIT days: plus button must NOT be visible ──
  if (oldNoUpdateBlock) {
    await oldNoUpdateBlock.hover();
    const oldPlusBtn = timeline.getStatusPlusButton(oldNoUpdateBlock, 'No Update');
    await expect(oldPlusBtn).toBeHidden();
  } else {
    console.warn(`No "No Update" entry older than ${BACKDATE_LIMIT} days found — skipping`);
  }
});

// ─── Case 3: "On Leave" — plus button opens editor within 4 days ────────────

test(`Case 3 - On Leave entry: plus button opens editor within ${BACKDATE_LIMIT} days`, async ({ loggedInPage }) => {
  const timeline = new TimelinePage(loggedInPage);
  const today = new Date();

  const allBlocks = await timeline.dayBlocks.all();
  let recentOnLeaveBlock = null;

  for (const block of allBlocks) {
    const text = await block.textContent();
    if (!text.includes('On Leave')) continue;

    const dateText = await timeline.getDateFromBlock(block);
    if (!dateText) continue;
    const parsedDate = parseDate(dateText);
    if (!parsedDate) continue;
    const daysDiff = getDaysDifference(parsedDate, today);

    if (daysDiff <= BACKDATE_LIMIT) {
      recentOnLeaveBlock = block;
      break;
    }
  }

  if (!recentOnLeaveBlock) {
    console.warn(`No "On Leave" entry within ${BACKDATE_LIMIT} days found — skipping test`);
    return;
  }

  await recentOnLeaveBlock.hover();
  // Use getStatusPlusButton to target the EXACT "On Leave" + button
  const plusBtn = timeline.getStatusPlusButton(recentOnLeaveBlock, 'On Leave');
  await expect(plusBtn).toBeVisible({ timeout: 5000 });
  await plusBtn.click();

  // Cancel button confirms the editor opened for a past day
  const cancelBtn = loggedInPage.getByRole('button', { name: /cancel/i });
  await expect(cancelBtn.first()).toBeVisible({ timeout: 6000 });

  // "Non Project Updates" chip should be available in the editor header
  const nonProjectChip = loggedInPage.getByText('Non Project Updates');
  await expect(nonProjectChip.first()).toBeVisible({ timeout: 3000 });

  // Dismiss editor
  await cancelBtn.first().click();
});
