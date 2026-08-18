import { toMonthKey } from './format'
import { KEYS, load } from './storage'
import { supabase } from './supabaseClient'

const MIGRATED_FLAG = 'expense-tracker:migrated:v1'

function sanitize(rows) {
  if (!Array.isArray(rows)) return []
  return rows.filter(
    (r) =>
      r &&
      typeof r.name === 'string' &&
      typeof r.date === 'string' &&
      typeof r.category === 'string' &&
      Number.isFinite(r.amount),
  )
}

/**
 * One-time import of pre-Supabase localStorage data into the signed-in
 * user's tables, then clears it so it doesn't get re-imported. Runs at most
 * once per browser via the flag below, and is a no-op once there's nothing
 * legacy left to find.
 *
 * The old budget was a single value applied to every month; that shape has
 * no equivalent under the new per-month schema, so it's seeded onto the
 * current month only -- the closest approximation, not a lossless migration.
 */
export async function migrateLegacyDataIfNeeded(userId) {
  if (window.localStorage.getItem(MIGRATED_FLAG)) return

  const legacyExpenses = sanitize(load(KEYS.legacyExpenses, []))
  const legacyBudget = load(KEYS.legacyBudget, null)

  if (legacyExpenses.length > 0) {
    const rows = legacyExpenses.map((e) => ({
      user_id: userId,
      name: e.name,
      amount: Math.round(Number(e.amount) * 100) / 100,
      category: e.category,
      date: e.date,
    }))
    const { error } = await supabase.from('expenses').insert(rows)
    if (error) {
      console.error('Legacy expense import failed', error)
      return
    }
  }

  if (Number.isFinite(legacyBudget) && legacyBudget >= 0) {
    const { error } = await supabase
      .from('budgets')
      .upsert({ user_id: userId, month: toMonthKey(), amount: legacyBudget })
    if (error) {
      console.error('Legacy budget import failed', error)
      return
    }
  }

  window.localStorage.setItem(MIGRATED_FLAG, '1')
  window.localStorage.removeItem(KEYS.legacyExpenses)
  window.localStorage.removeItem(KEYS.legacyBudget)
}
