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

## Project status

- [x] **Milestone 1** — Scaffold, Supabase clients, auth (email + Google),
      protected routes, DB schema + RLS, types
- [x] **Milestone 2** — Habit CRUD + monthly check-in grid
- [x] **Milestone 3** — Streaks + stats
- [x] **Milestone 4** — History charts + archive
- [x] **Milestone 5** — Themes (5 palettes) + PWA
- [x] **UX pass** — onboarding with starter habits, warm/data-rich redesign,
      responsive, distinct theme surfaces, password visibility, email
      confirmation flow

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

## Bugs encountered & how we fixed them

A running log of the real issues hit during development and their fixes.

### App / code bugs

1. **Timezone: new habits looked "locked" near midnight** (PR #12)
   `created_at` is stored in UTC, but "today" is computed in the user's local
   time. In timezones behind UTC, a habit created in the evening got a UTC
   `created_at` date of *tomorrow* — so the grid greyed out today's cell and
   stats read 0%.
   **Fix:** `habitStartISO()` in `lib/utils/dates.ts` clamps a habit's start
   date to never be after today; used in `HabitRow` and `lib/utils/stats.ts`.

2. **Theme menu crashed the dashboard** (Milestone 5)
   This shadcn build is based on **Base UI** (not Radix), where
   `DropdownMenuLabel` is a *group part* and must live inside a
   `DropdownMenuGroup`. Using it standalone threw "MenuGroupContext is missing"
   and took down the layout whenever the theme picker opened.
   **Fix:** wrap the label + items in `<DropdownMenuGroup>` in `ThemePicker`.

3. **Google OAuth bounced back to `/login`, then logged in after a refresh**
   (PRs #17, #18) Two root causes:
   - The `/auth/callback` route exchanged the code but set the session cookies
     on Next's `cookies()` store, which **isn't attached to a manually-created
     `NextResponse.redirect()`** — so the cookie was dropped on the redirect.
     **Fix:** bind the Supabase server client to the redirect response so the
     `Set-Cookie` headers ride along (`app/auth/callback/route.ts`).
   - The session was also being established **client-side**, leaving the user
     parked on `/login` until a manual refresh.
     **Fix:** `AuthRedirect` (on the auth layout) listens via
     `onAuthStateChange` and redirects to the dashboard the instant a session
     appears.

4. **Browser-extension hydration warning** (PR #5)
   Extensions inject attributes (e.g. `data-qb-installed`) onto `<html>` before
   React hydrates, causing a console hydration mismatch.
   **Fix:** `suppressHydrationWarning` on the `<html>` element.

5. **Tailwind v4 opacity on CSS variables didn't compile**
   `bg-[var(--streak)]/20` (opacity modifier on an arbitrary CSS-var color)
   silently fails in Tailwind v4. **Fix:** use built-in colors (e.g.
   `bg-amber-100`) or no opacity modifier.

### Config / environment gotchas

6. **Next.js 16 `middleware` deprecation** — the `middleware.ts` convention is
   renamed to `proxy.ts` (`export function proxy`). We use `proxy.ts`.

7. **Stale dev server on port 3000** — running `npm run build` while
   `npm run dev` is live wipes `.next`, and orphaned dev servers keep holding
   port 3000 so new ones silently move to 3001 and serve old code. If changes
   "don't show up," kill stale `node` processes and restart `npm run dev`.

8. **Email templates aren't editable without custom SMTP** — Supabase locks the
   email subject/body on the built-in mail service, so a typed **6-digit OTP**
   wasn't possible. We use the default **magic-link** confirmation instead;
   adding SMTP (e.g. Resend) would unlock templates and the OTP option.

9. **`Error 400: redirect_uri_mismatch` on Google login** — Google's OAuth
   client needs the **Supabase** callback in its Authorized redirect URIs:
   `https://<project-ref>.supabase.co/auth/v1/callback` (not the app URL).

10. **`email rate limit exceeded`** — Supabase's built-in email caps at a few
    sends/hour; heavy signup testing trips it. Resets hourly; SMTP removes it.

See [SETUP.md](SETUP.md) for Supabase setup and [DEPLOY.md](DEPLOY.md) for
Vercel deployment.

## Git workflow

`main` is protected — all work happens on `feature/`, `fix/`, `chore/`, etc.
branches via Pull Requests. See the conventional-commit prefixes (`feat:`,
`fix:`, `chore:`, `docs:`, `refactor:`).
