import { headers, cookies } from 'next/headers';
import { dateKey, shiftDate, startOfDate, validTimezone } from './dates';
export { dateKey, shiftDate, startOfDate } from './dates';
export async function getUserTimezone() {
  const saved = (await cookies()).get('apexfit-timezone')?.value;
  if (saved) {
    try { return validTimezone(decodeURIComponent(saved)); } catch { /* Fall back to location. */ }
  }
  return validTimezone((await headers()).get('x-vercel-ip-timezone') || 'Asia/Kolkata');
}
export function getStartOfDayInTimezone(zone: string) { return startOfDate(dateKey(new Date(), zone), zone); }
export function getEndOfDayInTimezone(zone: string) { return startOfDate(shiftDate(dateKey(new Date(), zone), 1), zone); }
export function getStartOfWeekInTimezone(zone: string) {
  const today = dateKey(new Date(), zone);
  const weekday = new Date(today + 'T12:00:00Z').getUTCDay();
  return startOfDate(shiftDate(today, -((weekday + 6) % 7)), zone);
}
