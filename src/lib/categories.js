/**
 * The seven expense categories and their permanent color slots.
 *
 * The color belongs to the category, never to its rank in the chart — a
 * category keeps its hue no matter how the donut sorts or which slices are
 * present. `cssVar` points at the token in index.css so light/dark swap for
 * free; `light`/`dark` hold the same hexes for anywhere a raw value is needed.
 *
 * This exact 7-slot ordering passes the dataviz palette validator in both
 * modes (adjacent CVD deltaE 9.1 light / 8.4 dark, normal-vision 19.6 / 19.3).
 * Do not add an eighth category or swap a hue without re-running it.
 */

export const CATEGORIES = [
  { id: 'food', label: 'Food & Dining', cssVar: '--series-food', light: '#2a78d6', dark: '#3987e5' },
  { id: 'transport', label: 'Transport', cssVar: '--series-transport', light: '#eb6834', dark: '#d95926' },
  { id: 'housing', label: 'Housing & Bills', cssVar: '--series-housing', light: '#1baf7a', dark: '#199e70' },
  { id: 'shopping', label: 'Shopping', cssVar: '--series-shopping', light: '#eda100', dark: '#c98500' },
  { id: 'entertainment', label: 'Entertainment', cssVar: '--series-entertainment', light: '#e87ba4', dark: '#d55181' },
  { id: 'health', label: 'Health', cssVar: '--series-health', light: '#008300', dark: '#008300' },
  { id: 'other', label: 'Other', cssVar: '--series-other', light: '#4a3aa7', dark: '#9085e9' },
]

export const DEFAULT_CATEGORY_ID = 'food'

const BY_ID = new Map(CATEGORIES.map((c) => [c.id, c]))
const FALLBACK = BY_ID.get('other')

/** Always returns a category — an unknown id (older data, hand-edited storage) falls back to Other. */
export function getCategory(id) {
  return BY_ID.get(id) ?? FALLBACK
}

/** The `var(--series-x)` string to hand to a `fill`, `stroke`, or `background`. */
export function categoryColor(id) {
  return `var(${getCategory(id).cssVar})`
}
