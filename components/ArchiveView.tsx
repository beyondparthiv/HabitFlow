"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { computeHabitStat, pct } from "@/lib/utils/stats";
import { formatLongDate, isoDateOf, todayISO } from "@/lib/utils/dates";
import type { Habit } from "@/lib/types";
import { Button } from "@/components/ui/button";

type CheckRow = { habit_id: string; date: string };

export function ArchiveView({
  habits: initial,
  checkIns,
}: {
  habits: Habit[];
  checkIns: CheckRow[];
}) {
  const supabase = useMemo(() => createClient(), []);
  const today = todayISO();
  const [habits, setHabits] = useState<Habit[]>(initial);
  const [confirming, setConfirming] = useState<string | null>(null);

  const doneByHabit = useMemo(() => {
    const map: Record<string, Set<string>> = {};
    for (const row of checkIns) (map[row.habit_id] ??= new Set()).add(row.date);
    return map;
  }, [checkIns]);

  function unarchive(h: Habit) {
    setHabits((prev) => prev.filter((x) => x.id !== h.id));
    supabase.from("habits").update({ archived: false }).eq("id", h.id).then();
  }

  function remove(h: Habit) {
    setHabits((prev) => prev.filter((x) => x.id !== h.id));
    supabase.from("habits").delete().eq("id", h.id).then();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Archive</h1>
        <p className="text-sm text-muted-foreground">
          Archived habits are hidden from your tracker but keep all their
          history. Restore one anytime, or delete it for good.
        </p>
      </div>

      {habits.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed p-12 text-center">
          <span className="mb-3 text-4xl">🗂️</span>
          <h2 className="text-lg font-semibold">Nothing archived</h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            When you remove a habit from the tracker, choose “Archive” to keep
            its history — it&apos;ll show up here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {habits.map((h) => {
            const stat = computeHabitStat(
              h,
              doneByHabit[h.id] ?? new Set(),
              today,
            );
            const isConfirming = confirming === h.id;
            return (
              <div
                key={h.id}
                className="flex flex-col gap-3 rounded-xl border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="truncate font-medium">{h.name}</div>
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    {h.category} · since {formatLongDate(isoDateOf(h.created_at))}{" "}
                    · {pct(stat.rate)} done · best 🔥 {stat.longest}
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  {isConfirming ? (
                    <>
                      <span className="text-xs text-muted-foreground">
                        Delete forever?
                      </span>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => remove(h)}
                      >
                        Confirm
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setConfirming(null)}
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button size="sm" onClick={() => unarchive(h)}>
                        Restore
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => setConfirming(h.id)}
                      >
                        Delete
                      </Button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
