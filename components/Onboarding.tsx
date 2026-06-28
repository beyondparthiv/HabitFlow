"use client";

import { useState } from "react";
import { AddHabitForm } from "@/components/AddHabitForm";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Category } from "@/lib/types";

const STARTERS: { emoji: string; label: string; category: Category }[] = [
  { emoji: "💧", label: "Drink water", category: "Health" },
  { emoji: "📚", label: "Read 20 minutes", category: "Study" },
  { emoji: "🏃", label: "Move my body", category: "Health" },
  { emoji: "🧘", label: "Meditate", category: "Personal" },
  { emoji: "😴", label: "Sleep by 11pm", category: "Health" },
  { emoji: "💸", label: "Track spending", category: "Finance" },
  { emoji: "✍️", label: "Journal", category: "Personal" },
  { emoji: "🥗", label: "Eat a veggie", category: "Health" },
];

export function Onboarding({
  onAdd,
}: {
  onAdd: (name: string, category: string) => Promise<void> | void;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);

  function toggle(label: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  }

  async function addSelected() {
    if (busy || selected.size === 0) return;
    setBusy(true);
    // Add in list order so positions stay sensible. Onboarding unmounts once
    // the first habit lands, but the loop keeps running in this closure.
    for (const s of STARTERS) {
      if (selected.has(s.label)) {
        await onAdd(`${s.emoji} ${s.label}`, s.category);
      }
    }
  }

  const count = selected.size;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-2xl border bg-gradient-to-b from-accent/40 to-card p-6 text-center sm:p-10">
        <div className="mb-3 text-5xl">🌱</div>
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Let&apos;s build your first habits
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground sm:text-base">
          Pick a few to start — tap to select as many as you like — or add your
          own below. Then just tap a day to check it off. 💪
        </p>

        <div className="mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {STARTERS.map((s) => {
            const isSelected = selected.has(s.label);
            return (
              <button
                key={s.label}
                type="button"
                onClick={() => toggle(s.label)}
                aria-pressed={isSelected}
                disabled={busy}
                className={cn(
                  "group relative flex items-center gap-2.5 rounded-xl border bg-card p-3 text-left transition-all hover:bg-accent/50 active:scale-[0.98] disabled:opacity-50",
                  isSelected
                    ? "border-primary ring-2 ring-primary/40"
                    : "hover:border-primary",
                )}
              >
                <span className="text-2xl">{s.emoji}</span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">
                    {s.label}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {s.category}
                  </span>
                </span>
                <span
                  className={cn(
                    "absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full text-[10px] transition-opacity",
                    isSelected
                      ? "bg-primary text-primary-foreground opacity-100"
                      : "opacity-0",
                  )}
                >
                  ✓
                </span>
              </button>
            );
          })}
        </div>

        <Button
          className="mt-5 w-full sm:w-auto"
          disabled={count === 0 || busy}
          onClick={addSelected}
        >
          {busy
            ? "Adding…"
            : count === 0
              ? "Select habits to begin"
              : `Add ${count} habit${count === 1 ? "" : "s"}`}
        </Button>

        <div className="my-6 flex items-center gap-3 text-xs uppercase text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          or add your own
          <span className="h-px flex-1 bg-border" />
        </div>

        <div className="flex justify-center">
          <AddHabitForm onAdd={onAdd} />
        </div>
      </div>
    </div>
  );
}
