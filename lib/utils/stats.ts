import {
  daysBetween,
  isoDateOf,
  monthDays,
  monthLabel,
  monthShort,
} from "@/lib/utils/dates";
import { currentStreak, longestStreak } from "@/lib/utils/streaks";
import type { Habit } from "@/lib/types";

export interface HabitStat {
  habit: Habit;
  current: number;
  longest: number;
  /** completed days since the habit was created (up to today) */
  done: number;
  /** active days since creation (inclusive of today) */
  active: number;
  /** done / active, in 0..1 */
  rate: number;
  doneToday: boolean;
  activeToday: boolean;
}

/** Full per-habit stats from its set of "done" ISO dates. */
export function computeHabitStat(
  habit: Habit,
  doneDates: Set<string>,
  today: string,
): HabitStat {
  const startISO = isoDateOf(habit.created_at);
  const activeToday = today >= startISO;
  const active = activeToday ? daysBetween(startISO, today) : 0;

  let done = 0;
  for (const d of doneDates) if (d >= startISO && d <= today) done++;

  return {
    habit,
    current: currentStreak(doneDates, startISO, today),
    longest: longestStreak(doneDates, startISO, today),
    done,
    active,
    rate: active ? done / active : 0,
    doneToday: doneDates.has(today),
    activeToday,
  };
}

export interface Summary {
  todayDone: number;
  todayTotal: number;
  overallDone: number;
  overallActive: number;
  overallRate: number;
  bestStreak: number;
}

/** Aggregate dashboard numbers from a list of per-habit stats. */
export function summarize(stats: HabitStat[]): Summary {
  let todayDone = 0;
  let todayTotal = 0;
  let overallDone = 0;
  let overallActive = 0;
  let bestStreak = 0;

  for (const s of stats) {
    if (s.activeToday) {
      todayTotal++;
      if (s.doneToday) todayDone++;
    }
    overallDone += s.done;
    overallActive += s.active;
    if (s.longest > bestStreak) bestStreak = s.longest;
  }

  return {
    todayDone,
    todayTotal,
    overallDone,
    overallActive,
    overallRate: overallActive ? overallDone / overallActive : 0,
    bestStreak,
  };
}

/**
 * Completion across all habits for a single month: done check-ins divided by
 * the number of "possible" cells (active days within the month for each habit).
 */
export function monthProgress(
  habits: Habit[],
  doneByHabit: Record<string, Set<string>>,
  year: number,
  monthIndex: number,
  today: string,
): { done: number; possible: number; rate: number } {
  const allDays = monthDays(year, monthIndex);
  let done = 0;
  let possible = 0;

  for (const habit of habits) {
    const startISO = isoDateOf(habit.created_at);
    const doneDates = doneByHabit[habit.id];
    for (const iso of allDays) {
      if (iso < startISO || iso > today) continue; // outside active range
      possible++;
      if (doneDates?.has(iso)) done++;
    }
  }

  return { done, possible, rate: possible ? done / possible : 0 };
}

export interface MonthStat {
  year: number;
  monthIndex: number;
  label: string; // "June 2026"
  short: string; // "Jun '26"
  done: number;
  possible: number;
  rate: number;
}

/**
 * Completion per calendar month, from the earliest habit's creation month
 * through the current month. Pass a single-habit list for a per-habit history.
 */
export function monthlyHistory(
  habits: Habit[],
  doneByHabit: Record<string, Set<string>>,
  today: string,
): MonthStat[] {
  if (habits.length === 0) return [];

  let earliest = isoDateOf(habits[0].created_at);
  for (const h of habits) {
    const d = isoDateOf(h.created_at);
    if (d < earliest) earliest = d;
  }

  let y = Number(earliest.slice(0, 4));
  let m = Number(earliest.slice(5, 7)) - 1;
  const ty = Number(today.slice(0, 4));
  const tm = Number(today.slice(5, 7)) - 1;

  const out: MonthStat[] = [];
  while (y < ty || (y === ty && m <= tm)) {
    const mp = monthProgress(habits, doneByHabit, y, m, today);
    out.push({
      year: y,
      monthIndex: m,
      label: monthLabel(y, m),
      short: monthShort(y, m),
      ...mp,
    });
    m += 1;
    if (m > 11) {
      m = 0;
      y += 1;
    }
  }
  return out;
}

/** The highest-completion month (ignoring months with no active days). */
export function bestMonth(history: MonthStat[]): MonthStat | null {
  let best: MonthStat | null = null;
  for (const ms of history) {
    if (ms.possible === 0) continue;
    if (!best || ms.rate > best.rate) best = ms;
  }
  return best;
}

/** Habits ranked by completion rate (desc), then by current streak. */
export function leaderboard(stats: HabitStat[]): HabitStat[] {
  return [...stats]
    .filter((s) => s.active > 0)
    .sort((a, b) => b.rate - a.rate || b.current - a.current);
}

export function pct(rate: number): string {
  return `${Math.round(rate * 100)}%`;
}
