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
  onAdd: (name: string, category: Category) => Promise<void> | void;
}) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState<Category>("Personal");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || busy) return;
    setBusy(true);
    try {
      await onAdd(trimmed, category);
      setName("");
      setCategory("Personal");
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
      <Button type="submit" size="sm" disabled={busy || !name.trim()}>
        Add habit
      </Button>
    </form>
  );
}
