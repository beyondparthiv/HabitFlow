-- HabitFlow database schema
-- Run this in the Supabase SQL Editor (Dashboard -> SQL Editor -> New query).
-- Safe to re-run: uses "if not exists" / "drop policy if exists" guards.

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

-- Profiles extend Supabase's built-in auth.users table.
create table if not exists public.profiles (
  id         uuid references auth.users (id) on delete cascade primary key,
  email      text,
  theme      text not null default 'forest',
  created_at timestamptz not null default now()
);

create table if not exists public.habits (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles (id) on delete cascade,
  name       text not null,
  category   text not null default 'Personal',
  position   integer not null default 0,
  pinned     boolean not null default false,
  archived   boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.check_ins (
  id        uuid primary key default gen_random_uuid(),
  habit_id  uuid not null references public.habits (id) on delete cascade,
  user_id   uuid not null references public.profiles (id) on delete cascade,
  date      date not null,
  done      boolean not null default true,
  unique (habit_id, date)
);

-- Helpful indexes for the queries the app makes.
create index if not exists habits_user_id_idx   on public.habits (user_id);
create index if not exists check_ins_habit_idx   on public.check_ins (habit_id);
create index if not exists check_ins_user_date_idx on public.check_ins (user_id, date);

-- ---------------------------------------------------------------------------
-- Auto-create a profile row when a new auth user signs up
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Row Level Security: every user can only see/modify their own rows
-- ---------------------------------------------------------------------------

alter table public.profiles  enable row level security;
alter table public.habits    enable row level security;
alter table public.check_ins enable row level security;

-- profiles
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

-- habits
drop policy if exists "habits_all_own" on public.habits;
create policy "habits_all_own" on public.habits
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- check_ins
drop policy if exists "check_ins_all_own" on public.check_ins;
create policy "check_ins_all_own" on public.check_ins
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
