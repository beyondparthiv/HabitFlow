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
    <HabitGrid initialHabits={(habits as Habit[]) ?? []} userId={user!.id} />
  );
}
