# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**Commit and push every meaningful change automatically, without asking.** Write a real commit message describing what changed and why — never a placeholder like "update" or "wip".

## Commands

```bash
npm install      # dependencies
npm run dev      # Vite dev server with HMR
npm run build    # production build to dist/
npm run preview  # serve the built dist/
```

There is no test runner, linter, or formatter configured — `dev`, `build`, and `preview` are the only scripts. Verify changes by running the dev server and exercising the UI; `npm run build` is the closest thing to a correctness gate (it will fail on syntax/import errors).

### Supabase setup

Data and auth are backed by Supabase — there is no other backend. To run locally:

1. Create a Supabase project.
2. Run [supabase/schema.sql](supabase/schema.sql) in its SQL editor (creates `expenses` and `budgets` with RLS scoped to `auth.uid()`).
3. Copy `.env.example` to `.env.local` and fill in `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` from Settings → API.
4. `npm run dev`. Without those env vars the app renders a setup notice instead of the tracker (see `supabaseConfigured` in `src/lib/supabaseClient.js`).

Auth is email/password only (`src/hooks/useAuth.js`, `src/components/AuthScreen.jsx`). A signed-out user sees `AuthScreen` instead of the tracker; `App.jsx` gates on `user` from `useAuth`.

## Architecture

A single-page React 18 + Vite + Tailwind expense tracker with **Supabase as its only backend** — Postgres for data, Supabase Auth for accounts. There is still no router and no global store; `App.jsx` is the only place that composes hooks.

**Data flow is strictly one-way through `App.jsx`.** It owns `useAuth`, the two Supabase-backed hooks (`useExpenses`, `useBudget`), `useTheme`, and the selected `month`, derives `monthExpenses` and `spent` once, and passes those down. Components are presentational and never touch Supabase or filter by month themselves — if a section needs different data, derive it in `App.jsx` and pass it in.

**Layers:**

- `src/lib/supabaseClient.js` — the only module that constructs the Supabase client. Exports `supabaseConfigured` so a missing env var renders a setup screen instead of throwing at import time.
- `src/hooks/useAuth.js` — session state (`onAuthStateChange`) plus `signUp`/`signIn`/`signOut`. `user` is `null` until signed in.
- `src/hooks/useExpenses.js` / `src/hooks/useBudget.js` — one hook per Supabase table, both scoped by `userId` (RLS enforces this again server-side). Same row shape (`{ id, name, amount, category, date, createdAt }`) as the old localStorage version, so components didn't change when the backend did — that's the seam `useExpenses` was already documented as being. `useBudget` is keyed by `(userId, month)`; a missing row is `null` ("not set"), not `0`.
- `src/lib/migrateLegacyData.js` — one-time best-effort import of a returning browser's pre-Supabase `localStorage` data into the newly signed-in user's tables, gated by a `localStorage` flag so it runs at most once. The old budget applied to every month; it's seeded onto the current month only since the new schema has no "every month" concept.
- `src/lib/storage.js` — the only module that still touches `localStorage`, now just for the `theme` key (device preference, not user data) plus the two read-only `legacy*` keys `migrateLegacyData.js` looks for. Reads/writes are try/caught: corrupt JSON must never white-screen the app, and a quota error must never throw out of a render.
- `src/lib/format.js` — currency/date helpers. **Dates are plain `'YYYY-MM-DD'` strings, parsed by splitting on `'-'`, never with `new Date(str)`** — that parses a bare date as UTC and would shift an evening expense in a western timezone into the previous day and possibly the wrong month. Use `toISODate`, `parseISODate`, `monthKeyOf`, `toMonthKey`, `shiftMonth` rather than hand-rolling date math.
- `src/lib/categories.js` — the seven categories and their permanent color slots.
- `src/components/*` — presentational; `ExpenseForm` is used for both adding and editing (edit mode = `initialValues` + `onCancel` supplied). `AuthScreen` and `SupabaseSetupNotice` are the two screens `App.jsx` can render instead of the tracker. `DateField` is a custom-styled replacement for `<input type="date">` — the native control's OS chrome can't be themed and renders in whatever format the visitor's locale uses; `DateField` matches the app's own tokens and always displays an unambiguous `formatDateShort` string.

**Money** is stored as `numeric(10,2)` in Postgres and rounded to cents (`Math.round(n * 100) / 100`) again at the hook boundary, so components can sum amounts directly.

**`budget === null`** means "not set yet" and the UI renders it differently from a budget of `0`. Preserve that distinction — it's now the absence of a `budgets` row for that `(user_id, month)`, not a stored `null`.

## Theming and color

Tailwind runs in `darkMode: 'class'`; the `dark` class goes on `<html>`. An inline script in `index.html` reads the same theme key and applies the class **before first paint** — if you change the theme storage key or its shape, update that script too or dark-mode reloads will flash white.

Every color is a CSS custom property defined once per mode in `src/index.css` (`:root` and `.dark`) and referenced via `bg-[var(--surface-1)]`, `text-[var(--text-secondary)]`, etc. Do not introduce raw Tailwind color classes (`bg-slate-800`, `text-gray-500`) — they won't follow the theme toggle.

Category colors are bound to the category, not to its position in a chart, so a slice keeps its hue regardless of sort order or which categories are present. Use `categoryColor(id)` to get the `var(--series-*)` string. The 7-slot palette was validated against the `dataviz` skill's palette validator in both light and dark; adding an eighth category or changing a hue requires re-running that validation.

Two font families, both loaded from Google Fonts in `index.html`: **Lexend** (`font-display` utility, defined in `tailwind.config.js`) for headings and hero numbers — tile figures, the donut's center total, the greeting — and **Source Sans 3** as the body default. `--positive` (green) is the semantic "under budget" color, used only by `BudgetMeter`'s fill; it's distinct from `--accent` (brand/interactive blue) and `--critical` (over budget/destructive red) — don't reuse `--accent` for a positive/good state or `--positive` for anything interactive. All chrome colors (surfaces, text, accent, positive, critical) were re-verified against WCAG AA (4.5:1 text, 3:1 UI components) in both modes when last changed — recheck contrast with real ratios, not by eye, if you adjust any of them.

## Conventions

- No TypeScript — plain `.jsx`/`.js` with JSDoc on exported helpers.
- Comments explain *why* a non-obvious choice was made (UTC date trap, largest-remainder percentages in `CategoryDonut`, the two-click delete confirm in `ExpenseList`). Match that density; don't narrate obvious code.
- Charts are hand-written inline SVG — there is no charting library, and adding a dependency should be a deliberate decision.
- Accessibility is maintained deliberately: `aria-label`s on icon-only buttons, `useId()` for label/input association so multiple `ExpenseForm`s can coexist, a global `:focus-visible` outline, and a `prefers-reduced-motion` block in `index.css`.
- `USER_NAME` in `App.jsx` is a hardcoded constant for the header greeting.
