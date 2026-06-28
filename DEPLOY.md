# Deploying HabitFlow to Vercel

Your code is on GitHub (`beyondparthiv/HabitFlow`), so the easiest path is
Vercel's GitHub import — it auto-deploys on every push afterwards.

## 1. Import the repo

1. Go to **https://vercel.com/new**
2. Sign in (use **Continue with GitHub** so it can see your repos)
3. Under **Import Git Repository**, find **`beyondparthiv/HabitFlow`** → click **Import**
   - If you don't see it, click **Adjust GitHub App Permissions** and grant
     Vercel access to the repo.

## 2. Configure the project

Vercel auto-detects **Next.js** — leave these as-is:

| Setting | Value |
|---|---|
| Framework Preset | Next.js (auto) |
| Root Directory | `./` (leave default) |
| Build Command | `next build` (auto) |
| Output Directory | (leave default) |
| Install Command | `npm install` (auto) |

## 3. Add Environment Variables (REQUIRED)

Expand **Environment Variables** and add these two (copy the values from your
local `.env.local`). Make sure all three environment scopes —
**Production, Preview, Development** — are checked for each.

| Name | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://vzgmqtulynzomjrulezg.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `sb_publishable_mLBH4V9DNZyj2wTFsoujBg_HT-YHMcK` |

> These are baked into the build, so they **must** be set before the first
> deploy or the app won't reach Supabase.

## 4. Deploy

Click **Deploy**. Wait ~1–2 minutes. You'll get a URL like
`https://habit-flow-xxxx.vercel.app`. Note this URL — you need it for step 5.

## 5. Point Supabase at your live URL (REQUIRED for login)

Auth redirects break until you allowlist the Vercel domain. In the Supabase
dashboard → **Authentication → URL Configuration**:

- **Site URL**: set to your Vercel URL, e.g. `https://habit-flow-xxxx.vercel.app`
- **Redirect URLs**: click Add and include both:
  - `https://habit-flow-xxxx.vercel.app/**`
  - `http://localhost:3000/**`  (keep this so local dev still works)

Click **Save**. Then reload your Vercel site and sign up / log in to confirm.

> If you later enable **Google OAuth**, also add
> `https://habit-flow-xxxx.vercel.app/auth/callback` to both the Supabase Google
> provider and your Google Cloud OAuth client's authorized redirect URIs.

## 6. Done — auto-deploy is now on

From now on, every `git push` to `main` triggers a production deploy, and
pushes to other branches create preview deployments. No extra steps.

---

## Alternative: deploy via the Vercel CLI

If you prefer the terminal:

```bash
npm install -g vercel
cd "C:\Northeastern University\Habbit tracker\habitflow"
vercel login            # opens your browser
vercel link --repo      # connect to the GitHub project
# add env vars (run for each, choose Production + Preview + Development):
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel deploy           # preview deploy  (add --prod for production)
```

Then do step 5 above (Supabase URL configuration) regardless of method.
