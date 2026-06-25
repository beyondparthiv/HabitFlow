# HabitFlow — Setup Guide

Get the app running locally in ~10 minutes.

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a free project.
2. Wait for it to finish provisioning (~2 min).

## 2. Run the database schema

1. In the Supabase dashboard, open **SQL Editor → New query**.
2. Paste the entire contents of [`supabase/schema.sql`](supabase/schema.sql) and click **Run**.
3. This creates the `profiles`, `habits`, and `check_ins` tables, enables Row
   Level Security, adds policies, and installs a trigger that auto-creates a
   profile row whenever someone signs up.

## 3. Get your API keys

In the dashboard go to **Project Settings → API Keys** (and **Data API** for the URL):

- **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- **anon / public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Copy `.env.example` to `.env.local` and paste both values in:

```bash
cp .env.example .env.local
```

> `.env.local` is gitignored — your keys never get committed.

## 4. Configure Auth

In **Authentication → Sign In / Providers**:

- **Email**: enabled by default. For frictionless local testing you can turn
  **off** "Confirm email" (Authentication → Sign In / Providers → Email).
- **Google** (optional): enable the Google provider and add your OAuth client
  ID/secret from the [Google Cloud Console](https://console.cloud.google.com).
  Add this authorized redirect URL:
  `https://<your-project-ref>.supabase.co/auth/v1/callback`

In **Authentication → URL Configuration**, set the **Site URL** to
`http://localhost:3000` for local development (add your Vercel URL later).

## 5. Run it

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You'll be redirected to
`/login`. Create an account, and you're in.

## Troubleshooting

- **Stuck on a redirect loop / "Auth session missing"** — double check both env
  vars are set in `.env.local` and restart `npm run dev`.
- **"Email not confirmed"** — either confirm via the email link or disable email
  confirmation (step 4) for local testing.
- **Google login fails** — verify the redirect URL in both Google Cloud and
  Supabase match exactly.
