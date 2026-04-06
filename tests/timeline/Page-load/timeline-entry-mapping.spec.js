import { test, expect } from '../../../fixtures/baseTest';
import { TimelinePage } from '../../../pages/TimelinePage';
import { getTimelineEditabilityMap } from '../../../utils/apiHelper';
import { convertToISO } from '../../../utils/dateHelper';

test.describe.configure({ mode: 'serial' });

test.setTimeout(180_000);

let editabilityMap = {};

test.beforeEach(async ({ loggedInPage }) => {
  const timeline = new TimelinePage(loggedInPage);

  await timeline.navigate();

  // Setup the map promise before clicking to go to 'My Timeline' so we capture the network request seamlessly
  const mapPromise = getTimelineEditabilityMap(loggedInPage);
  
  await timeline.goToMyTimelineViaMenu();
  
  try {
    editabilityMap = await mapPromise;
  } catch (e) {
    console.warn('Failed to fetch editability map:', e);
  }

  await timeline.waitForTimelineReady();
});


// ─── Case 1 ─────────────────────────────────────────────
test('Case 1 - Entry with existing update: project chip redirects', async ({ loggedInPage }) => {
  const timeline = new TimelinePage(loggedInPage);

  let projectChip = null;

  for (let attempt = 0; attempt < 5; attempt++) {
    const blocks = await timeline.dayBlocks.all();

    for (const block of blocks) {
      const candidates = timeline.getProjectLinkFromEntry(block);
      if (await candidates.count() > 0) {
        projectChip = candidates.first();
        break;
      }
    }

    if (projectChip) break;

    await loggedInPage.evaluate(() => window.scrollBy(0, window.innerHeight));
    await loggedInPage.waitForTimeout(1500);
  }

  if (!projectChip) return;

  await projectChip.hover();
  await expect(projectChip).toBeVisible();

  await Promise.all([
    loggedInPage.waitForURL(/\/user\/project\//),
    projectChip.click()
  ]);
});


// ─── Case 2 ─────────────────────────────────────────────
test('Case 2 - No Update entry: editability validation', async ({ loggedInPage }) => {
  const timeline = new TimelinePage(loggedInPage);

  const blocks = await timeline.dayBlocks.all();

  for (const block of blocks) {
    const text = await block.textContent();
    if (!text.includes('No Update')) continue;

    const dateText = await timeline.getDateFromBlock(block);
    if (!dateText) continue;

    const headerText = await timeline.getCurrentMonthHeader();
    const yearMatch = headerText?.match(/\d{4}/);
    const currentYear = yearMatch ? yearMatch[0] : undefined;

    const isoDate = convertToISO(dateText, currentYear);
    const isEditable = editabilityMap[isoDate];

    if (isEditable === undefined) continue;

    const plusBtn = timeline.getStatusPlusButton(block, 'No Update');

    if (isEditable) {
      await expect(plusBtn).toBeVisible();

      await plusBtn.click();

      const cancelBtn = loggedInPage.getByRole('button', { name: /cancel/i });
      await expect(cancelBtn.first()).toBeVisible();

      await cancelBtn.first().click();
    } else {
      await expect(plusBtn).toBeHidden();
    }
  }
});


// ─── Case 3 ─────────────────────────────────────────────
test('Case 3 - On Leave entry: editability validation', async ({ loggedInPage }) => {
  const timeline = new TimelinePage(loggedInPage);

  const blocks = await timeline.dayBlocks.all();

  for (const block of blocks) {
    const text = await block.textContent();
    if (!text.includes('On Leave')) continue;

    const dateText = await timeline.getDateFromBlock(block);
    if (!dateText) continue;

    const headerText = await timeline.getCurrentMonthHeader();
    const yearMatch = headerText?.match(/\d{4}/);
    const currentYear = yearMatch ? yearMatch[0] : undefined;

    const isoDate = convertToISO(dateText, currentYear);
    const isEditable = editabilityMap[isoDate];

    if (isEditable === undefined) continue;

    const plusBtn = timeline.getStatusPlusButton(block, 'On Leave');

    if (isEditable) {
      await expect(plusBtn).toBeVisible();

      await plusBtn.click();

      const cancelBtn = loggedInPage.getByRole('button', { name: /cancel/i });
      await expect(cancelBtn.first()).toBeVisible();

      const chip = loggedInPage.getByText('Non Project Updates');
      await expect(chip.first()).toBeVisible();

      await cancelBtn.first().click();
    } else {
      await expect(plusBtn).toBeHidden();
    }
  }
});