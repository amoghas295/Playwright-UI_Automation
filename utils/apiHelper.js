// utils/apiHelper.js

export async function getTimelineEditabilityMap(page) {
  const response = await page.waitForResponse(res =>
    res.url().includes('timeline') && res.url().includes('startDate') && res.status() === 200
  );

  const data = await response.json();

  const map = {};
  const items = Array.isArray(data) ? data : data.data;
  
  if (items && Array.isArray(items)) {
    for (const item of items) {
      if (item.date) {
        map[item.date] = item.isEditable;
      }
    }
  } else {
    console.warn('Unexpected API response format for editability map:', data);
  }

  return map;
}