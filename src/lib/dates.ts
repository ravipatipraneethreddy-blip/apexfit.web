/** Calendar operations shared by server and client. Never rely on server TZ. */
const formats = new Map<string, Intl.DateTimeFormat>();
export function validTimezone(zone: string): string {
  try { new Intl.DateTimeFormat('en', { timeZone: zone }).format(); return zone; }
  catch { return 'Asia/Kolkata'; }
}
export function dateKey(value: Date | string | number, timezone: string): string {
  const zone = validTimezone(timezone);
  if (!formats.has(zone)) formats.set(zone, new Intl.DateTimeFormat('en-CA', { timeZone: zone, year: 'numeric', month: '2-digit', day: '2-digit' }));
  return formats.get(zone)!.format(new Date(value));
}
export function shiftDate(day: string, days: number): string {
  const value = new Date(day + 'T12:00:00Z');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || !Number.isFinite(value.getTime()) || value.toISOString().slice(0, 10) !== day) throw new Error('Invalid date');
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}
export function startOfDate(day: string, zone: string): Date {
  shiftDate(day, 0); // Validate before comparing keys.
  const midnight = Date.parse(day + 'T00:00:00Z');
  let low = midnight - 36 * 3600000, high = midnight + 36 * 3600000;
  // Finds the first instant of a local calendar day, including DST and UTC+14.
  while (low < high) {
    const mid = Math.floor((low + high) / 2);
    if (dateKey(mid, zone) < day) low = mid + 1; else high = mid;
  }
  if (dateKey(low, zone) !== day) throw new Error('This calendar day does not exist in your timezone');
  return new Date(low);
}
export function dayDistance(a: string, b: string): number {
  return Math.round((Date.parse(a + 'T12:00:00Z') - Date.parse(b + 'T12:00:00Z')) / 86400000);
}
