"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORIES, type Category } from "@/lib/types";

export function AddHabitForm({
  onAdd,
}: {
  onAdd: (name: string, category: string) => Promise<void> | void;
}) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState<Category>("Personal");
  const [customLabel, setCustomLabel] = useState("");
  const [busy, setBusy] = useState(false);

  const isCustom = category === "Custom";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || busy) return;

    // When "Custom" is chosen, use the typed label (fall back to "Custom").
    const resolvedCategory =
      isCustom && customLabel.trim() ? customLabel.trim() : category;

    setBusy(true);
    try {
      await onAdd(trimmed, resolvedCategory);
      setName("");
      setCategory("Personal");
      setCustomLabel("");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-wrap items-center gap-2">
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Add a habit…  (e.g. Drink water)"
        className="h-9 w-56 flex-1 min-w-[12rem]"
        maxLength={80}
      />
      <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
        <SelectTrigger className="h-9 w-36" size="sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {CATEGORIES.map((c) => (
            <SelectItem key={c} value={c}>
              {c}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {isCustom && (
        <Input
          value={customLabel}
          onChange={(e) => setCustomLabel(e.target.value)}
          placeholder="Custom type…"
          className="h-9 w-36"
          maxLength={24}
          autoFocus
        />
      )}

      <Button type="submit" size="sm" disabled={busy || !name.trim()}>
        Add habit
      </Button>
    </form>
  );
}
