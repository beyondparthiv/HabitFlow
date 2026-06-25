import { createClient } from "@/lib/supabase/server";

export default async function TrackerPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: habits } = await supabase
    .from("habits")
    .select("*")
    .eq("user_id", user!.id)
    .eq("archived", false)
    .order("pinned", { ascending: false })
    .order("position", { ascending: true });

  const hasHabits = (habits?.length ?? 0) > 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Your habits</h1>
        <p className="text-sm text-muted-foreground">
          Build your streaks one day at a time.
        </p>
      </div>

      {hasHabits ? (
        <div className="rounded-lg border p-6">
          {/* The monthly check-in grid lands in Milestone 2. */}
          <p className="text-sm text-muted-foreground">
            {habits!.length} habit{habits!.length === 1 ? "" : "s"} loaded. The
            monthly grid is coming in the next milestone.
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <span className="mb-3 text-4xl">🌱</span>
          <h2 className="text-lg font-medium">No habits yet</h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Add your first habit to start tracking. Habit creation arrives in
            Milestone 2.
          </p>
        </div>
      )}
    </div>
  );
}
