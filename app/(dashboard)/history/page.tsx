import { createClient } from "@/lib/supabase/server";
import { HistoryView } from "@/components/HistoryView";
import type { Habit } from "@/lib/types";

export default async function HistoryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Include archived habits — their history is preserved.
  const { data: habits } = await supabase
    .from("habits")
    .select("*")
    .eq("user_id", user!.id)
    .order("pinned", { ascending: false })
    .order("position", { ascending: true });

  const { data: rows } = await supabase
    .from("check_ins")
    .select("habit_id, date, done")
    .eq("user_id", user!.id);

  const checkIns = (rows ?? [])
    .filter((r) => r.done)
    .map((r) => ({ habit_id: r.habit_id, date: r.date }));

  return (
    <HistoryView habits={(habits as Habit[]) ?? []} checkIns={checkIns} />
  );
}
