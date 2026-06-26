import { pct, type HabitStat, type Summary } from "@/lib/utils/stats";

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-lg border bg-card p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-xl font-semibold tabular-nums">{value}</div>
      {sub && <div className="text-xs text-muted-foreground">{sub}</div>}
    </div>
  );
}

export function StatsBar({
  summary,
  month,
  monthLabel,
  leaderboard,
}: {
  summary: Summary;
  month: { done: number; possible: number; rate: number };
  monthLabel: string;
  leaderboard: HabitStat[];
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          label="Today"
          value={`${summary.todayDone}/${summary.todayTotal}`}
          sub="habits done"
        />
        <StatCard
          label={monthLabel}
          value={pct(month.rate)}
          sub={`${month.done}/${month.possible} cells`}
        />
        <StatCard
          label="All-time"
          value={pct(summary.overallRate)}
          sub={`${summary.overallDone}/${summary.overallActive} days`}
        />
        <StatCard
          label="Best streak"
          value={`🔥 ${summary.bestStreak}`}
          sub="all habits"
        />
      </div>

      {leaderboard.length > 0 && (
        <div className="rounded-lg border bg-card p-4">
          <h3 className="mb-3 text-sm font-medium">Habit leaderboard</h3>
          <ul className="space-y-2.5">
            {leaderboard.map((s, i) => (
              <li key={s.habit.id} className="flex items-center gap-3">
                <span className="w-4 shrink-0 text-xs text-muted-foreground tabular-nums">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-medium">
                      {s.habit.name}
                    </span>
                    <span className="shrink-0 text-sm tabular-nums text-muted-foreground">
                      {pct(s.rate)}
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${Math.round(s.rate * 100)}%` }}
                    />
                  </div>
                </div>
                <div className="w-16 shrink-0 text-right">
                  <div className="text-sm tabular-nums" title="Current streak">
                    🔥 {s.current}
                  </div>
                  <div
                    className="text-[10px] text-muted-foreground tabular-nums"
                    title="Longest streak"
                  >
                    best {s.longest}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
