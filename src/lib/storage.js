/**
 * The only module that touches localStorage. Everything is JSON-encoded and
 * both directions are guarded: a corrupt value must never white-screen the app,
 * and a full quota must never throw out of a render.
 */

export const KEYS = {
  expenses: 'expense-tracker:expenses:v1',
  budget: 'expense-tracker:budget:v1',
  theme: 'expense-tracker:theme:v1',
}

export function load(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key)
    if (raw === null) return fallback
    const parsed = JSON.parse(raw)
    return parsed === null || parsed === undefined ? fallback : parsed
  } catch {
    return fallback
  }
}

export function save(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Quota exceeded or storage disabled (private browsing). The app keeps
    // working from in-memory state; only persistence is lost.
  }
}
