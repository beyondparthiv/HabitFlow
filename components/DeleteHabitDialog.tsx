"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Habit } from "@/lib/types";

export function DeleteHabitDialog({
  habit,
  open,
  onOpenChange,
  onArchive,
  onDelete,
}: {
  habit: Habit | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onArchive: (habit: Habit) => void;
  onDelete: (habit: Habit) => void;
}) {
  const [confirming, setConfirming] = useState(false);

  function handleOpenChange(next: boolean) {
    if (!next) setConfirming(false);
    onOpenChange(next);
  }

  if (!habit) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remove “{habit.name}”?</DialogTitle>
          <DialogDescription>
            {confirming
              ? "This permanently deletes the habit and all its check-in history. This cannot be undone."
              : "Choose how you'd like to remove this habit."}
          </DialogDescription>
        </DialogHeader>

        {confirming ? (
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => setConfirming(false)}>
              Back
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                onDelete(habit);
                handleOpenChange(false);
              }}
            >
              Yes, delete permanently
            </Button>
          </DialogFooter>
        ) : (
          <div className="flex flex-col gap-3 pt-2">
            <button
              onClick={() => {
                onArchive(habit);
                handleOpenChange(false);
              }}
              className="rounded-lg border p-4 text-left transition-colors hover:bg-muted"
            >
              <div className="font-medium">Archive</div>
              <p className="text-sm text-muted-foreground">
                Hide from the tracker but keep all history. View it later in
                the Archive section.
              </p>
            </button>
            <button
              onClick={() => setConfirming(true)}
              className="rounded-lg border border-destructive/30 p-4 text-left transition-colors hover:bg-destructive/10"
            >
              <div className="font-medium text-destructive">
                Delete permanently
              </div>
              <p className="text-sm text-muted-foreground">
                Erase the habit and every check-in. Cannot be undone.
              </p>
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
