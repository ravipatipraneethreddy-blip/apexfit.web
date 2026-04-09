import { headers } from "next/headers";

/**
 * Get the user's timezone from Vercel's geo-detection header.
 * Falls back to 'Asia/Kolkata' if not available.
 */
export async function getUserTimezone(): Promise<string> {
  try {
    const headersList = await headers();
    return headersList.get("x-vercel-ip-timezone") || "Asia/Kolkata";
  } catch {
    return "Asia/Kolkata";
  }
}

/**
 * Get the start of today (midnight) in the user's local timezone, as a UTC Date.
 * Example: For IST (UTC+5:30) on April 9:
 *   Midnight IST = April 8, 18:30 UTC
 */
export function getStartOfDayInTimezone(timezone: string): Date {
  const now = new Date();

  // Get the current date string in the user's timezone (YYYY-MM-DD format)
  const dateStr = now.toLocaleDateString("en-CA", { timeZone: timezone });
  // dateStr = "2026-04-09"

  // Calculate timezone offset by comparing UTC noon with local noon
  const utcNoon = new Date(dateStr + "T12:00:00Z");
  const localParts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  }).formatToParts(utcNoon);

  const localHour = parseInt(
    localParts.find((p) => p.type === "hour")?.value || "12"
  );
  const localMinute = parseInt(
    localParts.find((p) => p.type === "minute")?.value || "0"
  );

  // Offset in minutes: local_time - utc_time
  // For IST: 17:30 - 12:00 = +330 minutes
  const offsetMinutes = localHour * 60 + localMinute - 12 * 60;

  // Midnight in user's timezone = midnight UTC for that date - offset
  const utcMidnight = new Date(dateStr + "T00:00:00Z");
  const localMidnight = new Date(
    utcMidnight.getTime() - offsetMinutes * 60 * 1000
  );

  return localMidnight;
}

/**
 * Get the end of today (just before midnight tomorrow) in the user's timezone, as UTC Date.
 */
export function getEndOfDayInTimezone(timezone: string): Date {
  const startOfDay = getStartOfDayInTimezone(timezone);
  return new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);
}

/**
 * Get the start of the week (Monday) in the user's timezone, as UTC Date.
 */
export function getStartOfWeekInTimezone(timezone: string): Date {
  const now = new Date();

  // Get current date in user's timezone
  const dateStr = now.toLocaleDateString("en-CA", { timeZone: timezone });
  const [year, month, day] = dateStr.split("-").map(Number);

  // Find Monday of this week
  const localDate = new Date(year, month - 1, day);
  const dayOfWeek = localDate.getDay(); // 0=Sun, 1=Mon, ...
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  localDate.setDate(localDate.getDate() - daysToMonday);

  const mondayStr = localDate.toLocaleDateString("en-CA"); // YYYY-MM-DD

  // Calculate timezone offset
  const utcNoon = new Date(mondayStr + "T12:00:00Z");
  const localParts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  }).formatToParts(utcNoon);

  const localHour = parseInt(
    localParts.find((p) => p.type === "hour")?.value || "12"
  );
  const localMinute = parseInt(
    localParts.find((p) => p.type === "minute")?.value || "0"
  );
  const offsetMinutes = localHour * 60 + localMinute - 12 * 60;

  const utcMidnight = new Date(mondayStr + "T00:00:00Z");
  return new Date(utcMidnight.getTime() - offsetMinutes * 60 * 1000);
}
