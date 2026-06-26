"use client";

import { useState } from "react";
import { AddHabitForm } from "@/components/AddHabitForm";
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
  const [adding, setAdding] = useState<string | null>(null);

  async function addStarter(s: (typeof STARTERS)[number]) {
    if (adding) return;
    setAdding(s.label);
    await onAdd(`${s.emoji} ${s.label}`, s.category);
    // The view switches to the tracker once the first habit lands.
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-2xl border bg-gradient-to-b from-accent/40 to-card p-6 text-center sm:p-10">
        <div className="mb-3 text-5xl">🌱</div>
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Let&apos;s build your first habit
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground sm:text-base">
          Pick a starter to begin — or add your own below. Then just tap a day
          to check it off. That&apos;s the whole app. 💪
        </p>

        <div className="mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {STARTERS.map((s) => {
            const isAdding = adding === s.label;
            return (
              <button
                key={s.label}
                onClick={() => addStarter(s)}
                disabled={!!adding}
                className="group flex items-center gap-2.5 rounded-xl border bg-card p-3 text-left transition-all hover:border-primary hover:bg-accent/50 hover:shadow-sm disabled:opacity-50 active:scale-[0.98]"
              >
                <span className="text-2xl">{s.emoji}</span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">
                    {isAdding ? "Adding…" : s.label}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {s.category}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

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
