/**
 * Date helpers for the monthly grid. All "ISO date" strings are local-time
 * "YYYY-MM-DD" (no time component), which is what we store in check_ins.date
 * and what we compare lexicographically (safe for the YYYY-MM-DD format).
 */

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/** Local-time "YYYY-MM-DD" for a Date. */
export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Today's local date as "YYYY-MM-DD". */
export function todayISO(): string {
  return toISODate(new Date());
}

/** Number of days in the given month (monthIndex is 0-based). */
export function daysInMonth(year: number, monthIndex: number): number {
  return new Date(year, monthIndex + 1, 0).getDate();
}

/** Every day of the month as ISO date strings, in order. */
export function monthDays(year: number, monthIndex: number): string[] {
  const count = daysInMonth(year, monthIndex);
  return Array.from({ length: count }, (_, i) =>
    toISODate(new Date(year, monthIndex, i + 1)),
  );
}

/** Day-of-month number (1–31) from an ISO date string. */
export function dayOfMonth(iso: string): number {
  return Number(iso.slice(8, 10));
}

/** Short weekday label ("M", "T", …) for an ISO date string. */
export function weekdayLetter(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const wd = new Date(y, m - 1, d).getDay();
  return ["S", "M", "T", "W", "T", "F", "S"][wd];
}

/** True if the ISO date falls on a weekend (used for subtle column shading). */
export function isWeekend(iso: string): boolean {
  const [y, m, d] = iso.split("-").map(Number);
  const wd = new Date(y, m - 1, d).getDay();
  return wd === 0 || wd === 6;
}

/** "June 2026" style label. */
export function monthLabel(year: number, monthIndex: number): string {
  return `${MONTH_NAMES[monthIndex]} ${year}`;
}

/** "Jun '26" style short label (for compact charts/axes). */
export function monthShort(year: number, monthIndex: number): string {
  return `${MONTH_NAMES[monthIndex].slice(0, 3)} '${String(year).slice(2)}`;
}

/** "Jun 27, 2026" from an ISO date string (deterministic — no locale/TZ drift). */
export function formatLongDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${MONTH_NAMES[m - 1].slice(0, 3)} ${d}, ${y}`;
}

/** The day portion of a stored timestamp/timestamptz ("...T..." -> "YYYY-MM-DD"). */
export function isoDateOf(timestamp: string): string {
  return timestamp.slice(0, 10);
}

/** Add (or subtract) whole days to an ISO date string. */
export function addDays(iso: string, n: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  return toISODate(new Date(y, m - 1, d + n));
}

/** Inclusive count of days from `a` to `b` (both ISO). 0 if b < a. */
export function daysBetween(a: string, b: string): number {
  if (b < a) return 0;
  const [ay, am, ad] = a.split("-").map(Number);
  const [by, bm, bd] = b.split("-").map(Number);
  const ms = Date.UTC(by, bm - 1, bd) - Date.UTC(ay, am - 1, ad);
  return Math.round(ms / 86_400_000) + 1;
}
