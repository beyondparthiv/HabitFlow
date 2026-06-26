import { addDays } from "@/lib/utils/dates";

/**
 * Streak calculations operate on a set of "done" ISO date strings for a single
 * habit, the habit's start date (its created_at day), and today. Days before
 * the start date never count.
 */

/**
 * Current streak: consecutive completed days ending today (or yesterday, so a
 * not-yet-checked today doesn't break an active streak). Counts back until a
 * missed day or the habit's start date.
 */
export function currentStreak(
  doneDates: Set<string>,
  startISO: string,
  today: string,
): number {
  if (today < startISO) return 0;

  // If today isn't done yet, start counting from yesterday.
  let cursor = doneDates.has(today) ? today : addDays(today, -1);
  let streak = 0;

  while (cursor >= startISO && doneDates.has(cursor)) {
    streak++;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

/**
 * Longest streak: the longest run of consecutive completed days across all
 * history (clamped to [startISO, today]).
 */
export function longestStreak(
  doneDates: Set<string>,
  startISO: string,
  today: string,
): number {
  const sorted = [...doneDates]
    .filter((d) => d >= startISO && d <= today)
    .sort();

  let longest = 0;
  let run = 0;
  let prev: string | null = null;

  for (const d of sorted) {
    run = prev && d === addDays(prev, 1) ? run + 1 : 1;
    if (run > longest) longest = run;
    prev = d;
  }
  return longest;
}
