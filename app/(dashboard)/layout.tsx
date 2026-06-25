import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/SignOutButton";
import type { Theme } from "@/lib/types";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Middleware already guards this, but fail safe.
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("theme, email")
    .eq("id", user.id)
    .single();

  const theme: Theme = (profile?.theme as Theme) ?? "forest";

  return (
    <div data-theme={theme} className="min-h-screen bg-background text-foreground">
      <header className="border-b">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="text-xl">🌱</span>
            HabitFlow
          </Link>
          <nav className="flex items-center gap-1 text-sm">
            <Link href="/" className="rounded px-3 py-1.5 hover:bg-muted">
              Tracker
            </Link>
            <Link href="/history" className="rounded px-3 py-1.5 hover:bg-muted">
              History
            </Link>
            <Link href="/archive" className="rounded px-3 py-1.5 hover:bg-muted">
              Archive
            </Link>
            <span className="mx-2 hidden text-muted-foreground sm:inline">
              {profile?.email ?? user.email}
            </span>
            <SignOutButton />
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}
