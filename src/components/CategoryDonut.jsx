import { useMemo, useState } from 'react'
import { CATEGORIES, categoryColor } from '../lib/categories'
import { formatCurrency, formatCurrencyCompact } from '../lib/format'
import EmptyState from './EmptyState'

const SIZE = 240
const RADIUS = 88
const STROKE = 28
const HOVER_STROKE = 34
const GAP = 3 // user units of surface color between adjacent arcs — a gap, never an outline
const CENTER = SIZE / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

/**
 * Percentages that add up to exactly 100 (largest-remainder method). Naive
 * per-slice rounding routinely prints a legend summing to 99 or 101.
 */
function wholePercents(values, total) {
  if (total <= 0) return values.map(() => 0)
  const exact = values.map((v) => (v / total) * 100)
  const floors = exact.map(Math.floor)
  let remaining = 100 - floors.reduce((a, b) => a + b, 0)

  const order = exact
    .map((value, index) => ({ index, remainder: value - Math.floor(value) }))
    .sort((a, b) => b.remainder - a.remainder)

  const result = [...floors]
  for (let i = 0; i < order.length && remaining > 0; i += 1, remaining -= 1) {
    result[order[i].index] += 1
  }
  return result
}

export default function CategoryDonut({ expenses }) {
  const [active, setActive] = useState(null)

  const { slices, total } = useMemo(() => {
    const totals = new Map()
    let sum = 0
    for (const expense of expenses) {
      const key = CATEGORIES.some((c) => c.id === expense.category) ? expense.category : 'other'
      totals.set(key, (totals.get(key) ?? 0) + expense.amount)
      sum += expense.amount
    }

    const rows = CATEGORIES.filter((c) => (totals.get(c.id) ?? 0) > 0)
      .map((c) => ({ id: c.id, label: c.label, value: totals.get(c.id) }))
      .sort((a, b) => b.value - a.value)

    const percents = wholePercents(rows.map((r) => r.value), sum)

    // Walk the ring once, accumulating each arc's start offset.
    let offset = 0
    const withGeometry = rows.map((row, i) => {
      const arc = (row.value / sum) * CIRCUMFERENCE
      const start = offset
      offset += arc
      return { ...row, percent: percents[i], arc, start }
    })

    return { slices: withGeometry, total: sum }
  }, [expenses])

  if (slices.length === 0) {
    return <EmptyState title="Nothing to chart yet" hint="Spending by category appears here once you add an expense." />
  }

  const single = slices.length === 1

  return (
    <div className="flex flex-col items-center gap-6 md:flex-row md:items-center md:gap-8">
      <div className="relative shrink-0" style={{ width: SIZE, height: SIZE }}>
        <svg
          width={SIZE}
          height={SIZE}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          role="img"
          aria-label={`Spending by category, ${formatCurrency(total)} total. Values are listed beside the chart.`}
        >
          {/* -90deg so the first (largest) slice starts at 12 o'clock. */}
          <g transform={`rotate(-90 ${CENTER} ${CENTER})`}>
            {slices.map((slice) => {
              // A lone slice is a continuous ring — subtracting a gap would
              // leave a notch in what should be an unbroken circle.
              const dash = single ? CIRCUMFERENCE : Math.max(slice.arc - GAP, 1)
              const isActive = active === slice.id
              const dimmed = active !== null && !isActive

              return (
                <circle
                  key={slice.id}
                  cx={CENTER}
                  cy={CENTER}
                  r={RADIUS}
                  fill="none"
                  stroke={categoryColor(slice.id)}
                  strokeWidth={isActive ? HOVER_STROKE : STROKE}
                  strokeDasharray={`${dash} ${CIRCUMFERENCE - dash}`}
                  strokeDashoffset={-slice.start}
                  opacity={dimmed ? 0.35 : 1}
                  className="transition-all duration-200"
                  onMouseEnter={() => setActive(slice.id)}
                  onMouseLeave={() => setActive(null)}
                />
              )
            })}
          </g>
        </svg>

        {/* Hero figure. Proportional digits — tabular-nums reads loose at this size. */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          {active === null ? (
            <>
              <span className="font-display text-[2.25rem] font-semibold leading-none tracking-tight">
                {formatCurrencyCompact(total)}
              </span>
              <span className="mt-1.5 text-xs text-[var(--text-secondary)]">spent</span>
            </>
          ) : (
            (() => {
              const slice = slices.find((s) => s.id === active)
              return (
                <>
                  <span className="font-display text-[2rem] font-semibold leading-none tracking-tight">
                    {formatCurrencyCompact(slice.value)}
                  </span>
                  <span className="mt-1.5 max-w-[7.5rem] text-center text-xs text-[var(--text-secondary)]">
                    {slice.label}
                  </span>
                </>
              )
            })()
          )}
        </div>
      </div>

      {/*
        The legend is the table-view twin: every slice carries a text label,
        its amount, and its share, so no value is readable only by color.
        It is never optional and never truncated.
      */}
      <ul className="flex w-full min-w-0 flex-col gap-0.5">
        {slices.map((slice) => (
          <li key={slice.id}>
            <button
              type="button"
              onMouseEnter={() => setActive(slice.id)}
              onMouseLeave={() => setActive(null)}
              onFocus={() => setActive(slice.id)}
              onBlur={() => setActive(null)}
              className={`flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition-colors ${
                active === slice.id ? 'bg-[var(--surface-2)]' : ''
              }`}
            >
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: categoryColor(slice.id) }}
                aria-hidden="true"
              />
              <span className="min-w-0 flex-1 truncate text-sm">{slice.label}</span>
              <span className="shrink-0 text-sm font-medium tabular-nums">{formatCurrency(slice.value)}</span>
              <span className="w-10 shrink-0 text-right text-sm tabular-nums text-[var(--text-muted)]">
                {slice.percent}%
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
