// utils/dateHelper.js

export function convertToISO(dateStr, yearOverride) {
  const year = yearOverride || new Date().getFullYear();
  
  // Format should be YYYY-MM-DD in local time
  const d = new Date(`${dateStr} ${year}`);
  
  // To avoid timezone shifts from toISOString(), format manually:
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  
  return `${yyyy}-${mm}-${dd}`;
}