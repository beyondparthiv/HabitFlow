"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/**
 * Lives on the auth pages (/login, /signup). The moment a session appears in
 * the browser — e.g. after an OAuth round-trip where Supabase establishes the
 * session client-side — this redirects to the dashboard. Without it the user
 * lands back on /login and has to refresh for the server to notice the cookie.
 */
export function AuthRedirect() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    // Already signed in when hitting an auth page → go straight in.
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        router.replace("/");
        router.refresh();
      }
    });

    // Fires when the browser client picks up a session (OAuth / magic link).
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        router.replace("/");
        router.refresh();
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  return null;
}
