/**
 * Currency, date, and month helpers.
 *
 * Dates are stored as plain 'YYYY-MM-DD' strings and parsed by splitting on
 * '-', never with `new Date(str)`: that parses a bare date as UTC, so a
 * late-evening expense in a western timezone would render as the previous day
 * and could land in the wrong month.
 */

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const currencyWhole = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

/** '$1,240.50' — for row amounts and totals. */
export function formatCurrency(amount) {
  return currency.format(amount ?? 0)
}

/** '$1,240' — for large display figures where cents are noise. */
export function formatCurrencyCompact(amount) {
  return currencyWhole.format(amount ?? 0)
}

/** Local-time 'YYYY-MM-DD' for a Date (defaults to now). */
export function toISODate(date = new Date()) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** Local-time 'YYYY-MM' for a Date (defaults to now). */
export function toMonthKey(date = new Date()) {
  return toISODate(date).slice(0, 7)
}

/** The 'YYYY-MM' a stored expense date belongs to. */
export function monthKeyOf(isoDate) {
  return String(isoDate).slice(0, 7)
}

/** A local Date at midnight from 'YYYY-MM-DD' — no UTC shift. */
export function parseISODate(isoDate) {
  const [y, m, d] = String(isoDate).split('-').map(Number)
  return new Date(y, (m || 1) - 1, d || 1)
}

/** Step a 'YYYY-MM' key forward or backward by whole months. */
export function shiftMonth(monthKey, delta) {
  const [y, m] = monthKey.split('-').map(Number)
  const date = new Date(y, m - 1 + delta, 1)
  return toMonthKey(date)
}

/** 'August 2026' */
export function formatMonthLabel(monthKey) {
  const [y, m] = monthKey.split('-').map(Number)
  return new Date(y, m - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

/** 'Today', 'Yesterday', or 'Fri, Aug 7' — for the list's date subheadings. */
export function formatDateHeading(isoDate) {
  const today = toISODate()
  if (isoDate === today) return 'Today'

  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  if (isoDate === toISODate(yesterday)) return 'Yesterday'

  const date = parseISODate(isoDate)
  const sameYear = date.getFullYear() === new Date().getFullYear()
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    ...(sameYear ? {} : { year: 'numeric' }),
  })
}
