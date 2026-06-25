# 🌱 HabitFlow

A daily habit tracker web app — monthly check-in grid, streaks, stats, history
charts, and 5 selectable color themes. Built with Next.js 16 (App Router),
TypeScript, Tailwind v4, shadcn/ui, and Supabase.

## Stack

- **Frontend / Backend**: Next.js 16 App Router (Route Handlers for the API)
- **Database + Auth**: Supabase (Postgres, Row Level Security, email + Google OAuth)
- **UI**: Tailwind CSS v4 + shadcn/ui
- **Charts**: Recharts
- **Deploy**: Vercel

## Getting started

See **[SETUP.md](SETUP.md)** for the full Supabase + env setup, then:

```bash
npm install
npm run dev
```

## Project status (incremental build)

- [x] **Milestone 1** — Scaffold, Supabase clients, auth (email + Google),
      protected routes, DB schema + RLS, types
- [ ] **Milestone 2** — Habit CRUD + monthly check-in grid
- [ ] **Milestone 3** — Streaks + stats
- [ ] **Milestone 4** — History charts + archive
- [ ] **Milestone 5** — Themes + PWA

## Project structure

```
app/
  (auth)/login, (auth)/signup   ← auth pages
  (dashboard)/                  ← protected app (tracker, history, archive)
  auth/callback, auth/signout   ← OAuth + sign-out route handlers
components/ui/                  ← shadcn components
lib/supabase/                   ← browser + server clients, session proxy
lib/types.ts                    ← DB + app types
supabase/schema.sql             ← run this in Supabase SQL editor
```

## Git workflow

`main` is protected — all work happens on `feature/`, `fix/`, `chore/`, etc.
branches via Pull Requests. See the conventional-commit prefixes (`feat:`,
`fix:`, `chore:`, `docs:`, `refactor:`).
