"use client";

import { useMemo } from "react";
import Link from "next/link";
import { todayISO } from "@/lib/utils/dates";
import {
  bestMonth,
  computeHabitStat,
  monthlyHistory,
  pct,
  type MonthStat,
} from "@/lib/utils/stats";
import type { Habit } from "@/lib/types";
import { HistoryChart } from "@/components/HistoryChart";

type CheckRow = { habit_id: string; date: string };

function MonthBar({ ms, highlight }: { ms: MonthStat; highlight: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-20 shrink-0 text-sm">{ms.label}</span>
      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full transition-all ${
            highlight ? "bg-[var(--streak)]" : "bg-primary"
          }`}
          style={{ width: `${Math.round(ms.rate * 100)}%` }}
        />
      </div>
      <span className="w-20 shrink-0 text-right text-sm tabular-nums">
        {pct(ms.rate)}
        <span className="ml-1 text-xs text-muted-foreground">
          {ms.done}/{ms.possible}
        </span>
      </span>
    </div>
  );
}

function Sparkline({ months }: { months: MonthStat[] }) {
  return (
    <div className="flex h-12 items-end gap-0.5">
      {months.map((m) => (
        <div
          key={`${m.year}-${m.monthIndex}`}
          title={`${m.label}: ${pct(m.rate)}`}
          className="flex-1 rounded-t bg-primary/80"
          style={{ height: `${Math.max(4, Math.round(m.rate * 100))}%` }}
        />
      ))}
    </div>
  );
}

export function HistoryView({
  habits,
  checkIns,
}: {
  habits: Habit[];
  checkIns: CheckRow[];
}) {
  const today = todayISO();

  const doneByHabit = useMemo(() => {
    const map: Record<string, Set<string>> = {};
    for (const row of checkIns) {
      (map[row.habit_id] ??= new Set()).add(row.date);
    }
    return map;
  }, [checkIns]);

  const history = useMemo(
    () => monthlyHistory(habits, doneByHabit, today),
    [habits, doneByHabit, today],
  );
  const best = useMemo(() => bestMonth(history), [history]);
  const last6 = history.slice(-6);
  const bestKey = best ? `${best.year}-${best.monthIndex}` : undefined;

  const perHabit = useMemo(
    () =>
      habits.map((h) => ({
        habit: h,
        months: monthlyHistory(
          [h],
          { [h.id]: doneByHabit[h.id] ?? new Set() },
          today,
        ),
        rate: computeHabitStat(h, doneByHabit[h.id] ?? new Set(), today).rate,
      })),
    [habits, doneByHabit, today],
  );

  if (habits.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed p-12 text-center">
        <span className="mb-3 text-4xl">📊</span>
        <h2 className="text-lg font-semibold">No history yet</h2>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Once you add habits and start checking off days, your monthly progress
          will show up here.
        </p>
        <Link
          href="/"
          className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Go to tracker
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">History</h1>
        <p className="text-sm text-muted-foreground">
          Your monthly progress over time.
        </p>
      </div>

      {/* Best month ever */}
      {best && best.possible > 0 && (
        <div className="rounded-2xl border bg-gradient-to-br from-amber-100 via-accent/30 to-card p-5">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🏆</span>
            <div>
              <div className="text-xs font-medium uppercase text-muted-foreground">
                Best month ever
              </div>
              <div className="text-xl font-bold">
                {best.label} —{" "}
                <span className="text-[var(--streak-foreground)]">
                  {pct(best.rate)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Last 6 months chart */}
      <div className="rounded-2xl border bg-card p-4 sm:p-5">
        <h2 className="mb-3 text-sm font-semibold">Last 6 months</h2>
        <HistoryChart data={last6} bestKey={bestKey} />
      </div>

      {/* All months */}
      <div className="rounded-2xl border bg-card p-4 sm:p-5">
        <h2 className="mb-4 text-sm font-semibold">All months</h2>
        <div className="space-y-3">
          {[...history].reverse().map((ms) => (
            <MonthBar
              key={`${ms.year}-${ms.monthIndex}`}
              ms={ms}
              highlight={`${ms.year}-${ms.monthIndex}` === bestKey}
            />
          ))}
        </div>
      </div>

      {/* By habit */}
      <div className="rounded-2xl border bg-card p-4 sm:p-5">
        <h2 className="mb-4 text-sm font-semibold">By habit</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {perHabit.map(({ habit, months, rate }) => (
            <div key={habit.id} className="rounded-xl border p-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="min-w-0 truncate text-sm font-medium">
                  {habit.name}
                  {habit.archived && (
                    <span className="ml-2 rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                      archived
                    </span>
                  )}
                </span>
                <span className="shrink-0 text-sm font-semibold tabular-nums">
                  {pct(rate)}
                </span>
              </div>
              <Sparkline months={months} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
