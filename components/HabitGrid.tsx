"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  isWeekend,
  monthDays as buildMonthDays,
  monthLabel,
  todayISO,
  weekdayLetter,
} from "@/lib/utils/dates";
import {
  computeHabitStat,
  leaderboard,
  monthProgress,
  summarize,
} from "@/lib/utils/stats";
import type { Habit } from "@/lib/types";
import { AddHabitForm } from "@/components/AddHabitForm";
import { MonthNav } from "@/components/MonthNav";
import { HabitRow } from "@/components/HabitRow";
import { DeleteHabitDialog } from "@/components/DeleteHabitDialog";
import { StatsBar } from "@/components/StatsBar";

type CheckInMap = Record<string, Record<string, boolean>>;

function sortHabits(habits: Habit[]): Habit[] {
  return [...habits].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    if (a.position !== b.position) return a.position - b.position;
    return a.created_at.localeCompare(b.created_at);
  });
}

export function HabitGrid({
  initialHabits,
  userId,
}: {
  initialHabits: Habit[];
  userId: string;
}) {
  const supabase = useMemo(() => createClient(), []);
  const today = todayISO();
  const now = useMemo(() => new Date(), []);

  const [habits, setHabits] = useState<Habit[]>(() =>
    sortHabits(initialHabits),
  );
  const [checkIns, setCheckIns] = useState<CheckInMap>({});
  const [view, setView] = useState(() => ({
    year: now.getFullYear(),
    monthIndex: now.getMonth(),
  }));
  const [deleting, setDeleting] = useState<Habit | null>(null);

  const days = useMemo(
    () => buildMonthDays(view.year, view.monthIndex),
    [view],
  );

  const isCurrentMonth =
    view.year === now.getFullYear() && view.monthIndex === now.getMonth();
  const canGoNext = !isCurrentMonth;

  // Load ALL of the user's check-ins once. The grid renders only the visible
  // month from this map, while streaks/stats use the full history.
  useEffect(() => {
    let cancelled = false;
    supabase
      .from("check_ins")
      .select("habit_id, date, done")
      .eq("user_id", userId)
      .then(({ data }) => {
        if (cancelled || !data) return;
        const map: CheckInMap = {};
        for (const row of data) {
          if (!row.done) continue;
          (map[row.habit_id] ??= {})[row.date] = true;
        }
        setCheckIns(map);
      });
    return () => {
      cancelled = true;
    };
  }, [supabase, userId]);

  // --- Mutations (optimistic) ----------------------------------------------

  const toggle = useCallback(
    (habit: Habit, iso: string) => {
      const next = !checkIns[habit.id]?.[iso];
      setCheckIns((prev) => {
        const inner = { ...(prev[habit.id] ?? {}) };
        if (next) inner[iso] = true;
        else delete inner[iso];
        return { ...prev, [habit.id]: inner };
      });

      const revert = () =>
        setCheckIns((prev) => {
          const inner = { ...(prev[habit.id] ?? {}) };
          if (next) delete inner[iso];
          else inner[iso] = true;
          return { ...prev, [habit.id]: inner };
        });

      const op = next
        ? supabase.from("check_ins").upsert(
            { habit_id: habit.id, user_id: userId, date: iso, done: true },
            { onConflict: "habit_id,date" },
          )
        : supabase
            .from("check_ins")
            .delete()
            .eq("habit_id", habit.id)
            .eq("date", iso);

      op.then(({ error }) => {
        if (error) revert();
      });
    },
    [checkIns, supabase, userId],
  );

  const addHabit = useCallback(
    async (name: string, category: string) => {
      const position = habits.length;
      const { data, error } = await supabase
        .from("habits")
        .insert({ user_id: userId, name, category, position })
        .select()
        .single();
      if (error || !data) return;
      setHabits((prev) => sortHabits([...prev, data]));
    },
    [habits.length, supabase, userId],
  );

  const renameHabit = useCallback(
    (habit: Habit, name: string) => {
      setHabits((prev) =>
        sortHabits(prev.map((h) => (h.id === habit.id ? { ...h, name } : h))),
      );
      supabase.from("habits").update({ name }).eq("id", habit.id).then();
    },
    [supabase],
  );

  const togglePin = useCallback(
    (habit: Habit) => {
      const pinned = !habit.pinned;
      setHabits((prev) =>
        sortHabits(
          prev.map((h) => (h.id === habit.id ? { ...h, pinned } : h)),
        ),
      );
      supabase.from("habits").update({ pinned }).eq("id", habit.id).then();
    },
    [supabase],
  );

  const archiveHabit = useCallback(
    (habit: Habit) => {
      setHabits((prev) => prev.filter((h) => h.id !== habit.id));
      supabase.from("habits").update({ archived: true }).eq("id", habit.id).then();
    },
    [supabase],
  );

  const deleteHabit = useCallback(
    (habit: Habit) => {
      setHabits((prev) => prev.filter((h) => h.id !== habit.id));
      supabase.from("habits").delete().eq("id", habit.id).then();
    },
    [supabase],
  );

  // --- Live stats -----------------------------------------------------------

  const doneByHabit = useMemo(() => {
    const map: Record<string, Set<string>> = {};
    for (const [habitId, dates] of Object.entries(checkIns)) {
      map[habitId] = new Set(Object.keys(dates));
    }
    return map;
  }, [checkIns]);

  const stats = useMemo(
    () =>
      habits.map((h) =>
        computeHabitStat(h, doneByHabit[h.id] ?? new Set(), today),
      ),
    [habits, doneByHabit, today],
  );

  const summary = useMemo(() => summarize(stats), [stats]);
  const board = useMemo(() => leaderboard(stats), [stats]);
  const month = useMemo(
    () => monthProgress(habits, doneByHabit, view.year, view.monthIndex, today),
    [habits, doneByHabit, view, today],
  );
  const streakByHabit = useMemo(() => {
    const m: Record<string, number> = {};
    for (const s of stats) m[s.habit.id] = s.current;
    return m;
  }, [stats]);

  // --- Render ---------------------------------------------------------------

  const gridTemplate = `var(--label-col) repeat(${days.length}, var(--day-col))`;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <AddHabitForm onAdd={addHabit} />
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            Today:{" "}
            <span className="font-medium text-foreground">
              {summary.todayDone}/{summary.todayTotal}
            </span>
          </span>
          <MonthNav
            year={view.year}
            monthIndex={view.monthIndex}
            canGoNext={canGoNext}
            onPrev={() =>
              setView((v) =>
                v.monthIndex === 0
                  ? { year: v.year - 1, monthIndex: 11 }
                  : { ...v, monthIndex: v.monthIndex - 1 },
              )
            }
            onNext={() =>
              setView((v) =>
                v.monthIndex === 11
                  ? { year: v.year + 1, monthIndex: 0 }
                  : { ...v, monthIndex: v.monthIndex + 1 },
              )
            }
          />
        </div>
      </div>

      {habits.length > 0 && (
        <StatsBar
          summary={summary}
          month={month}
          monthLabel={monthLabel(view.year, view.monthIndex)}
          leaderboard={board}
        />
      )}

      {habits.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <span className="mb-3 text-4xl">🌱</span>
          <h2 className="text-lg font-medium">No habits yet</h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Add your first habit above to start tracking. Tap any day to mark it
            done.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <div className="min-w-max">
            {/* Header row */}
            <div className="grid" style={{ gridTemplateColumns: gridTemplate }}>
              <div className="sticky left-0 z-10 border-b border-r bg-card px-2 py-1.5 text-xs font-medium text-muted-foreground">
                Habit
              </div>
              {days.map((iso) => (
                <div
                  key={iso}
                  className={`flex flex-col items-center border-b border-r py-1 text-[10px] leading-tight ${
                    isWeekend(iso) ? "bg-muted/30" : ""
                  } ${iso === today ? "bg-primary/10 font-semibold" : ""}`}
                >
                  <span className="text-muted-foreground">
                    {weekdayLetter(iso)}
                  </span>
                  <span>{Number(iso.slice(8, 10))}</span>
                </div>
              ))}
            </div>

            {/* Habit rows */}
            {habits.map((habit) => (
              <div
                key={habit.id}
                className="grid"
                style={{ gridTemplateColumns: gridTemplate }}
              >
                <HabitRow
                  habit={habit}
                  days={days}
                  today={today}
                  doneMap={checkIns[habit.id] ?? {}}
                  currentStreak={streakByHabit[habit.id] ?? 0}
                  onToggle={toggle}
                  onRename={renameHabit}
                  onTogglePin={togglePin}
                  onRequestDelete={setDeleting}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Double-click a name to rename · 📌 to pin · ✕ to archive or delete ·
        grayed days are before the habit existed · future days are locked
      </p>

      <DeleteHabitDialog
        habit={deleting}
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        onArchive={archiveHabit}
        onDelete={deleteHabit}
      />
    </div>
  );
}
