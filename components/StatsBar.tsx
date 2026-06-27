import { pct, type HabitStat, type Summary } from "@/lib/utils/stats";

function motivation(done: number, total: number) {
  if (total === 0)
    return { emoji: "🌱", title: "Ready when you are", sub: "Add a habit to start your first streak." };
  if (done === 0)
    return {
      emoji: "☀️",
      title: "A fresh day",
      sub: `${total} habit${total > 1 ? "s" : ""} waiting — tap today to check one off.`,
    };
  if (done < total)
    return {
      emoji: "💪",
      title: `${done} of ${total} done today`,
      sub: "Keep the momentum going — you've got this!",
    };
  return { emoji: "🎉", title: "All done today!", sub: "Amazing work. See you tomorrow." };
}

function StatCard({
  icon,
  iconBg,
  label,
  value,
  sub,
}: {
  icon: string;
  iconBg: string;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-3 sm:p-4">
      <div className="flex items-center gap-2">
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-base ${iconBg}`}
        >
          {icon}
        </span>
        <span className="text-xs font-medium text-muted-foreground">
          {label}
        </span>
      </div>
      <div className="mt-2 text-2xl font-bold tabular-nums sm:text-3xl">
        {value}
      </div>
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
  const msg = motivation(summary.todayDone, summary.todayTotal);
  const todayPct =
    summary.todayTotal > 0
      ? Math.round((summary.todayDone / summary.todayTotal) * 100)
      : 0;

  return (
    <div className="space-y-4">
      {/* Motivational header with today's progress */}
      <div className="rounded-2xl border bg-gradient-to-br from-primary/10 via-accent/30 to-card p-4 sm:p-5">
        <div className="flex items-center gap-3">
          <span className="text-3xl sm:text-4xl">{msg.emoji}</span>
          <div className="min-w-0">
            <h2 className="truncate text-lg font-bold sm:text-xl">
              {msg.title}
            </h2>
            <p className="text-sm text-muted-foreground">{msg.sub}</p>
          </div>
        </div>
        {summary.todayTotal > 0 && (
          <div className="mt-3">
            <div className="h-2.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${todayPct}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Bold stat cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          icon="📅"
          iconBg="bg-primary/15"
          label={monthLabel}
          value={pct(month.rate)}
          sub={`${month.done}/${month.possible} done`}
        />
        <StatCard
          icon="🎯"
          iconBg="bg-chart-5/15"
          label="All-time"
          value={pct(summary.overallRate)}
          sub={`${summary.overallDone}/${summary.overallActive} days`}
        />
        <StatCard
          icon="🔥"
          iconBg="bg-amber-400/20"
          label="Best streak"
          value={`${summary.bestStreak}`}
          sub="days in a row"
        />
        <StatCard
          icon="✅"
          iconBg="bg-emerald-400/20"
          label="Today"
          value={`${summary.todayDone}/${summary.todayTotal}`}
          sub="habits done"
        />
      </div>

      {/* Leaderboard */}
      {leaderboard.length > 0 && (
        <div className="rounded-xl border bg-card p-4">
          <h3 className="mb-3 flex items-center gap-1.5 text-sm font-semibold">
            🏆 Habit leaderboard
          </h3>
          <ul className="space-y-3">
            {leaderboard.map((s, i) => (
              <li key={s.habit.id} className="flex items-center gap-3">
                <span className="w-5 shrink-0 text-center text-xs font-medium text-muted-foreground tabular-nums">
                  {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-medium">
                      {s.habit.name}
                    </span>
                    <span className="shrink-0 text-sm font-semibold tabular-nums">
                      {pct(s.rate)}
                    </span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
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
