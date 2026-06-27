"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { createClient } from "@/lib/supabase/client";
import type { Theme } from "@/lib/types";

type ThemeContextValue = {
  theme: Theme;
  setTheme: (t: Theme) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}

export function ThemeProvider({
  initialTheme,
  userId,
  children,
}: {
  initialTheme: Theme;
  userId: string;
  children: React.ReactNode;
}) {
  const supabase = useMemo(() => createClient(), []);
  const [theme, setThemeState] = useState<Theme>(initialTheme);

  const setTheme = useCallback(
    (t: Theme) => {
      setThemeState(t); // apply instantly
      // Persist to the user's profile (syncs across devices on next load).
      supabase.from("profiles").update({ theme: t }).eq("id", userId).then();
    },
    [supabase, userId],
  );

  return (
    <div
      data-theme={theme}
      className="min-h-screen bg-background text-foreground"
    >
      <ThemeContext.Provider value={{ theme, setTheme }}>
        {children}
      </ThemeContext.Provider>
    </div>
  );
}
