# Keystone — Web App

A hybrid project management web app (working name **Keystone**). This folder is a **ready-to-deploy static site** — the multi-view prototype (Grid, Gantt, Board, Dashboard) running as a real, shareable web app.

```
keystone-app/
├─ index.html      ← the app (open it locally to preview)
├─ vercel.json     ← Vercel config (clean URLs + basic security headers)
├─ .gitignore
└─ README.md       ← you are here
```

To preview locally, just double-click `index.html` — it opens in any browser, no install needed.

---

## Deploy to Vercel

Pick **one** of the two paths below. Path A is the fastest (no accounts beyond Vercel, no command line).

### Path A — Drag & drop (easiest, ~2 minutes)

1. Go to **https://vercel.com** and sign up / log in (free; "Continue with GitHub" or email both work).
2. On your dashboard click **Add New… → Project**.
3. Choose the **deploy a template / import** screen, then look for the **"Deploy"** option that lets you upload — or simply use the Vercel CLI in Path B. *(Vercel's web UI deploys from Git; for a pure drag-and-drop with no Git, use the CLI in Path B — it's still just two commands.)*
4. Once deployed, Vercel gives you a live URL like `https://keystone-app.vercel.app`. Done.

> Tip: if you'd rather not touch a terminal at all, **Netlify Drop** (https://app.netlify.com/drop) lets you literally drag this `keystone-app` folder onto the page and get an instant URL. Vercel via Path B below is just as quick once set up.

### Path B — Vercel CLI (no Git needed, ~3 minutes)

1. Install Node.js if you don't have it: https://nodejs.org (LTS version).
2. Open a terminal **in this `keystone-app` folder**.
3. Run:
   ```bash
   npm install -g vercel
   vercel
   ```
4. Answer the prompts (accept defaults — it auto-detects a static site). On first run it logs you in via the browser.
5. Vercel prints your live URL. To push updates later, run `vercel --prod`.

### Path C — GitHub + Vercel (best for ongoing changes)

1. Create a new repo on **github.com** (e.g. `keystone-app`).
2. Upload the contents of this folder to the repo (GitHub's web UI has an "upload files" button — no command line required).
3. In Vercel: **Add New… → Project → Import** your `keystone-app` repo → **Deploy**.
4. From now on, every change you push to GitHub auto-deploys. This is the path to use once you start building the real product.

No build step is required — Vercel serves `index.html` directly.

---

## What this is (and isn't) yet — Phase 1 MVP

**Is:** a real, usable single-user app. Add, edit and delete tasks; changes **persist in your browser** (localStorage) and stay in sync across all four views (Grid, Gantt, Board, Dashboard). Includes CSV export and a computed dashboard.

**Isn't (yet):** a shared backend. Data lives in *your* browser only — it isn't synced between people or devices, and there's no login. That's the next step (Supabase: auth + Postgres + realtime), which needs a Supabase account to wire up.

## AI "Scope of Work → Plan" — one-time setup

The **SOW → Plan** tab sends pasted scope-of-work text to Claude (via the `api/analyze.js` serverless function) and proposes milestones you can review, edit, approve/reject, and push into the chart. The Anthropic API key stays on the server — the browser never sees it.

To turn it on:

1. Get an API key from the Anthropic Console (`https://console.anthropic.com` → API Keys).
2. In Vercel: open the **keystone-app** project → **Settings → Environment Variables**.
3. Add a variable named `ANTHROPIC_API_KEY` with your key as the value (apply to Production). Optionally add `ANTHROPIC_MODEL` (defaults to `claude-sonnet-4-6`).
4. **Redeploy** (Deployments → ⋯ → Redeploy) so the new variable is picked up.

Until the key is set, the SOW tab still loads, but Analyze returns a friendly "AI is not configured yet" message.

## Next step — turn it into a real product

When you're ready to move from prototype to MVP (per **Phase 1** in `Keystone_Framework.md`):

1. **Scaffold** a React + TypeScript app with Vite.
2. **Add Supabase** (free tier) for auth + Postgres database + realtime — so tasks persist and multiple people can collaborate live.
3. **Port each view** from this prototype into React components (Grid, Gantt, Board, Dashboard), reading/writing real data.
4. **Build the scheduling engine** as a separate, unit-tested TypeScript module (the critical-path math is the crown jewel).
5. Keep deploying to Vercel the same way — the GitHub path (C) above makes every change go live automatically.

I can generate that Phase-1 scaffold for you whenever you want — just ask.
