# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install      # dependencies
npm run dev      # Vite dev server with HMR
npm run build    # production build to dist/
npm run preview  # serve the built dist/
```

There is no test runner, linter, or formatter configured — `dev`, `build`, and `preview` are the only scripts. Verify changes by running the dev server and exercising the UI; `npm run build` is the closest thing to a correctness gate (it will fail on syntax/import errors).

## Architecture

A single-page React 18 + Vite + Tailwind expense tracker with **no backend**. All state lives in `localStorage`; there is no network layer, no router, and no global store.

**Data flow is strictly one-way through `App.jsx`.** It owns the three hooks (`useExpenses`, `useBudget`, `useTheme`) plus the selected `month`, derives `monthExpenses` and `spent` once, and passes those down. Components are presentational and never read storage or filter by month themselves — if a section needs different data, derive it in `App.jsx` and pass it in.

**Layers:**

- `src/lib/storage.js` — the only module that touches `localStorage`. Both read and write are try/caught: corrupt JSON must never white-screen the app, and a quota error must never throw out of a render. All keys live in the exported `KEYS` object (`expense-tracker:*:v1`).
- `src/hooks/*` — one hook per persisted slice. Each seeds state from `load()` and mirrors it back with a `useEffect` + `save()`. `useExpenses` also sanitizes rows on load (localStorage can hold anything) and is deliberately thin — it's the seam a real backend would replace without any component changing.
- `src/lib/format.js` — currency/date helpers. **Dates are plain `'YYYY-MM-DD'` strings, parsed by splitting on `'-'`, never with `new Date(str)`** — that parses a bare date as UTC and would shift an evening expense in a western timezone into the previous day and possibly the wrong month. Use `toISODate`, `parseISODate`, `monthKeyOf`, `toMonthKey`, `shiftMonth` rather than hand-rolling date math.
- `src/lib/categories.js` — the seven categories and their permanent color slots.
- `src/components/*` — presentational; `ExpenseForm` is used for both adding and editing (edit mode = `initialValues` + `onCancel` supplied).

**Money** is stored as a number rounded to cents (`Math.round(n * 100) / 100`) at the hook boundary, so components can sum amounts directly.

**`budget === null`** means "not set yet" and the UI renders it differently from a budget of `0`. Preserve that distinction.

## Theming and color

Tailwind runs in `darkMode: 'class'`; the `dark` class goes on `<html>`. An inline script in `index.html` reads the same theme key and applies the class **before first paint** — if you change the theme storage key or its shape, update that script too or dark-mode reloads will flash white.

Every color is a CSS custom property defined once per mode in `src/index.css` (`:root` and `.dark`) and referenced via `bg-[var(--surface-1)]`, `text-[var(--text-secondary)]`, etc. Do not introduce raw Tailwind color classes (`bg-slate-800`, `text-gray-500`) — they won't follow the theme toggle.

Category colors are bound to the category, not to its position in a chart, so a slice keeps its hue regardless of sort order or which categories are present. Use `categoryColor(id)` to get the `var(--series-*)` string. The 7-slot palette was validated against the `dataviz` skill's palette validator in both light and dark; adding an eighth category or changing a hue requires re-running that validation.

## Conventions

- No TypeScript — plain `.jsx`/`.js` with JSDoc on exported helpers.
- Comments explain *why* a non-obvious choice was made (UTC date trap, largest-remainder percentages in `CategoryDonut`, the two-click delete confirm in `ExpenseList`). Match that density; don't narrate obvious code.
- Charts are hand-written inline SVG — there is no charting library, and adding a dependency should be a deliberate decision.
- Accessibility is maintained deliberately: `aria-label`s on icon-only buttons, `useId()` for label/input association so multiple `ExpenseForm`s can coexist, a global `:focus-visible` outline, and a `prefers-reduced-motion` block in `index.css`.
- `USER_NAME` in `App.jsx` is a hardcoded constant for the header greeting.
