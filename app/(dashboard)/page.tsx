import { createClient } from "@/lib/supabase/server";
import { HabitGrid } from "@/components/HabitGrid";
import type { Habit } from "@/lib/types";

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Your habits</h1>
        <p className="text-sm text-muted-foreground">
          Build your streaks one day at a time.
        </p>
      </div>

      <HabitGrid
        initialHabits={(habits as Habit[]) ?? []}
        userId={user!.id}
      />
    </div>
  );
}
