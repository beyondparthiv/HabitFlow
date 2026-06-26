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
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-y-2 px-3 py-3 sm:px-4">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="text-xl">🌱</span>
            HabitFlow
          </Link>
          <nav className="flex items-center gap-0.5 text-sm sm:gap-1">
            <Link href="/" className="rounded px-2 py-1.5 hover:bg-muted sm:px-3">
              Tracker
            </Link>
            <Link href="/history" className="rounded px-2 py-1.5 hover:bg-muted sm:px-3">
              History
            </Link>
            <Link href="/archive" className="rounded px-2 py-1.5 hover:bg-muted sm:px-3">
              Archive
            </Link>
            <span className="mx-2 hidden text-muted-foreground md:inline">
              {profile?.email ?? user.email}
            </span>
            <SignOutButton />
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-3 py-6 sm:px-4 sm:py-8">{children}</main>
    </div>
  );
}
