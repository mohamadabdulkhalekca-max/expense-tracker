-- Expense Tracker schema for Supabase.
--
-- Run this once in the Supabase SQL editor (or via `supabase db push`) on a
-- fresh project. Auth itself needs no setup here beyond enabling the
-- Email provider in Authentication > Providers, which is on by default.
--
-- Every table is scoped to auth.uid() via Row Level Security, so a signed-in
-- user can only ever see or touch their own rows -- the app never filters by
-- user_id itself, RLS does it unconditionally.

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  amount numeric(10, 2) not null check (amount >= 0),
  category text not null,
  date date not null,
  created_at timestamptz not null default now()
);

create index if not exists expenses_user_date_idx on public.expenses (user_id, date);

alter table public.expenses enable row level security;

create policy "expenses_select_own" on public.expenses
  for select using (auth.uid() = user_id);

create policy "expenses_insert_own" on public.expenses
  for insert with check (auth.uid() = user_id);

create policy "expenses_update_own" on public.expenses
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "expenses_delete_own" on public.expenses
  for delete using (auth.uid() = user_id);

-- One budget per user per month ('YYYY-MM'), matching the app's month keys.
-- A missing row means "not set yet", which the UI treats differently from a
-- budget of 0 -- do not backfill zero rows to represent "unset".
create table if not exists public.budgets (
  user_id uuid not null references auth.users (id) on delete cascade,
  month text not null check (month ~ '^\d{4}-\d{2}$'),
  amount numeric(10, 2) not null check (amount >= 0),
  updated_at timestamptz not null default now(),
  primary key (user_id, month)
);

alter table public.budgets enable row level security;

create policy "budgets_select_own" on public.budgets
  for select using (auth.uid() = user_id);

create policy "budgets_insert_own" on public.budgets
  for insert with check (auth.uid() = user_id);

create policy "budgets_update_own" on public.budgets
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "budgets_delete_own" on public.budgets
  for delete using (auth.uid() = user_id);
