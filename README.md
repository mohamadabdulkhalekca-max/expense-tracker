# Expense Tracker

A single-page expense tracker with monthly budgets, category breakdowns, and dark mode.

## Features

- Log expenses with name, amount, category, and date
- Set a monthly budget and track spend against it (a budget of "not set" is distinguished from a budget of $0)
- Category breakdown via a hand-written SVG donut chart, with colors bound to each category
- Light/dark theme, switched before first paint to avoid a flash of the wrong theme
- Email/password auth; a returning browser's pre-Supabase local data is migrated in automatically on first sign-in

## Tech stack

React 18 + Vite + Tailwind CSS, with [Supabase](https://supabase.com) (Postgres + Auth) as the only backend. No router, no global store, no TypeScript, no charting library.

## Setup

```bash
npm install
```

1. Create a Supabase project.
2. Run [supabase/schema.sql](supabase/schema.sql) in its SQL editor (creates `expenses` and `budgets` tables with RLS scoped to `auth.uid()`).
3. Copy `.env.example` to `.env.local` and fill in `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` from Settings → API.

```bash
npm run dev      # start the dev server
npm run build    # production build to dist/
npm run preview  # serve the built dist/
```

Without the Supabase env vars set, the app renders a setup notice instead of the tracker.
