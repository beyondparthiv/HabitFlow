"use client";

import { useEffect, useRef, useState } from "react";
import { dayOfMonth } from "@/lib/utils/dates";
import { isoDateOf } from "@/lib/utils/dates";
import type { Habit } from "@/lib/types";
import { cn } from "@/lib/utils";

export function HabitRow({
  habit,
  days,
  today,
  doneMap,
  onToggle,
  onRename,
  onTogglePin,
  onRequestDelete,
}: {
  habit: Habit;
  days: string[];
  today: string;
  doneMap: Record<string, boolean>;
  onToggle: (habit: Habit, iso: string) => void;
  onRename: (habit: Habit, name: string) => void;
  onTogglePin: (habit: Habit) => void;
  onRequestDelete: (habit: Habit) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(habit.name);
  const inputRef = useRef<HTMLInputElement>(null);
  const startISO = isoDateOf(habit.created_at);

  useEffect(() => {
    if (editing) inputRef.current?.select();
  }, [editing]);

  function commit() {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== habit.name) onRename(habit, trimmed);
    else setDraft(habit.name);
    setEditing(false);
  }

  return (
    <>
      {/* Sticky left column: name + controls */}
      <div className="sticky left-0 z-10 flex items-center gap-1 border-b border-r bg-card px-2 py-1.5">
        <button
          onClick={() => onTogglePin(habit)}
          aria-label={habit.pinned ? "Unpin habit" : "Pin habit"}
          title={habit.pinned ? "Unpin" : "Pin to top"}
          className={cn(
            "shrink-0 rounded px-1 text-sm transition-opacity",
            habit.pinned ? "opacity-100" : "opacity-30 hover:opacity-70",
          )}
        >
          📌
        </button>

        {editing ? (
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === "Enter") commit();
              if (e.key === "Escape") {
                setDraft(habit.name);
                setEditing(false);
              }
            }}
            maxLength={80}
            className="min-w-0 flex-1 rounded border bg-background px-1.5 py-0.5 text-sm outline-none"
          />
        ) : (
          <button
            onDoubleClick={() => {
              setDraft(habit.name);
              setEditing(true);
            }}
            title="Double-click to rename"
            className="min-w-0 flex-1 truncate text-left text-sm font-medium"
          >
            {habit.name}
            <span className="ml-1.5 text-xs font-normal text-muted-foreground">
              {habit.category}
            </span>
          </button>
        )}

        <button
          onClick={() => onRequestDelete(habit)}
          aria-label="Remove habit"
          title="Archive or delete"
          className="shrink-0 rounded px-1 text-sm text-muted-foreground opacity-40 transition-opacity hover:text-destructive hover:opacity-100"
        >
          ✕
        </button>
      </div>

      {/* Day cells */}
      {days.map((iso) => {
        const isFuture = iso > today;
        const isBeforeStart = iso < startISO;
        const done = !!doneMap[iso];
        const locked = isFuture || isBeforeStart;

        return (
          <div
            key={iso}
            className="flex items-center justify-center border-b border-r p-0.5"
          >
            <button
              disabled={locked}
              onClick={() => onToggle(habit, iso)}
              aria-label={`${habit.name} on ${iso}${done ? " (done)" : ""}`}
              aria-pressed={done}
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-md text-xs transition-colors",
                isBeforeStart && "cursor-not-allowed bg-muted/40",
                isFuture && "cursor-not-allowed opacity-40",
                !locked &&
                  !done &&
                  "border border-border hover:bg-primary/15",
                !locked &&
                  done &&
                  "bg-primary text-primary-foreground hover:bg-primary/90",
              )}
            >
              {done ? "✓" : ""}
              <span className="sr-only">{dayOfMonth(iso)}</span>
            </button>
          </div>
        );
      })}
    </>
  );
}
