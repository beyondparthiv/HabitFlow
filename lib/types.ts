/**
 * Shared application + database types for HabitFlow.
 *
 * These mirror the Postgres schema in supabase/schema.sql. If you change the
 * schema, update these to match (or generate them with the Supabase CLI:
 * `supabase gen types typescript`).
 */

export const THEMES = [
  "forest",
  "sunrise",
  "ocean",
  "midnight",
  "ember",
] as const;
export type Theme = (typeof THEMES)[number];

export const CATEGORIES = [
  "Health",
  "Study",
  "Finance",
  "Personal",
  "Custom",
] as const;
export type Category = (typeof CATEGORIES)[number];

export interface Profile {
  id: string;
  email: string | null;
  theme: Theme;
  created_at: string;
}

export interface Habit {
  id: string;
  user_id: string;
  name: string;
  category: Category;
  position: number;
  pinned: boolean;
  archived: boolean;
  created_at: string;
}

export interface CheckIn {
  id: string;
  habit_id: string;
  user_id: string;
  /** ISO date string, e.g. "2026-06-25" */
  date: string;
  done: boolean;
}

/** A habit with its check-ins resolved into a fast date -> done lookup. */
export interface HabitWithCheckIns extends Habit {
  /** key = ISO date string ("YYYY-MM-DD"), value = done */
  checkIns: Record<string, boolean>;
}

/**
 * Minimal typed surface for the Supabase client's `.from(...)` calls.
 * Lets us write `supabase.from("habits")` with row/insert/update inference.
 */
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & { id: string };
        Update: Partial<Profile>;
      };
      habits: {
        Row: Habit;
        Insert: Partial<Habit> & { user_id: string; name: string };
        Update: Partial<Habit>;
      };
      check_ins: {
        Row: CheckIn;
        Insert: Partial<CheckIn> & {
          habit_id: string;
          user_id: string;
          date: string;
        };
        Update: Partial<CheckIn>;
      };
    };
  };
}
