"use client";

import { Button } from "@/components/ui/button";
import { monthLabel } from "@/lib/utils/dates";

export function MonthNav({
  year,
  monthIndex,
  onPrev,
  onNext,
  canGoNext,
}: {
  year: number;
  monthIndex: number;
  onPrev: () => void;
  onNext: () => void;
  canGoNext: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={onPrev} aria-label="Previous month">
        ←
      </Button>
      <span className="min-w-[8.5rem] text-center text-sm font-medium">
        {monthLabel(year, monthIndex)}
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={onNext}
        disabled={!canGoNext}
        aria-label="Next month"
      >
        →
      </Button>
    </div>
  );
}
