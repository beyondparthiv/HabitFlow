import { createClient } from "@/lib/supabase/server";
import { ArchiveView } from "@/components/ArchiveView";
import type { Habit } from "@/lib/types";

export default async function ArchivePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: habits } = await supabase
    .from("habits")
    .select("*")
    .eq("user_id", user!.id)
    .eq("archived", true)
    .order("created_at", { ascending: true });

  const { data: rows } = await supabase
    .from("check_ins")
    .select("habit_id, date, done")
    .eq("user_id", user!.id);

  const checkIns = (rows ?? [])
    .filter((r) => r.done)
    .map((r) => ({ habit_id: r.habit_id, date: r.date }));

  return (
    <ArchiveView habits={(habits as Habit[]) ?? []} checkIns={checkIns} />
  );
}
