import { cn } from "@/lib/utils";

/** Small flame badge showing a streak count. Dims to zero gracefully. */
export function StreakBadge({
  count,
  label,
  className,
}: {
  count: number;
  label?: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-sm tabular-nums",
        count === 0 && "opacity-40",
        className,
      )}
      title={label}
    >
      <span aria-hidden>🔥</span>
      <span className="font-medium">{count}</span>
      {label && <span className="text-xs text-muted-foreground">{label}</span>}
    </span>
  );
}
