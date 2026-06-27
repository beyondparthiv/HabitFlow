"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { THEMES, type Theme } from "@/lib/types";
import { useTheme } from "@/components/ThemeProvider";

const META: Record<Theme, { label: string; swatch: string; hint: string }> = {
  forest: { label: "Forest", swatch: "#16a34a", hint: "Calm & focused" },
  sunrise: { label: "Sunrise", swatch: "#f59e0b", hint: "Warm & energizing" },
  ocean: { label: "Ocean", swatch: "#0ea5e9", hint: "Clean & fresh" },
  midnight: { label: "Midnight", swatch: "#8b5cf6", hint: "Focus mode" },
  ember: { label: "Ember", swatch: "#ef4444", hint: "High energy" },
};

export function ThemePicker() {
  const { theme, setTheme } = useTheme();
  const current = META[theme];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Change theme"
        className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted"
      >
        <span
          className="h-3.5 w-3.5 rounded-full ring-1 ring-black/10"
          style={{ backgroundColor: current.swatch }}
        />
        <span className="hidden sm:inline">{current.label}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Theme</DropdownMenuLabel>
          {THEMES.map((t) => {
            const m = META[t];
            const active = t === theme;
            return (
              <DropdownMenuItem
                key={t}
                onClick={() => setTheme(t)}
                className="flex items-center gap-2.5"
              >
                <span
                  className="h-4 w-4 shrink-0 rounded-full ring-1 ring-black/10"
                  style={{ backgroundColor: m.swatch }}
                />
                <span className="flex-1">
                  <span className="block text-sm">{m.label}</span>
                  <span className="block text-xs text-muted-foreground">
                    {m.hint}
                  </span>
                </span>
                {active && <span className="text-primary">✓</span>}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
