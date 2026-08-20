import { formatCurrency } from '../lib/format'

function AlertIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M8 2.8 14.5 13.5h-13L8 2.8Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M8 6.6v3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="8" cy="11.6" r="0.75" fill="currentColor" />
    </svg>
  )
}

/**
 * A ratio against a limit — a meter, not a chart. No axis, no legend.
 * Over budget switches the fill to the critical color AND adds an icon plus a
 * worded label, so the state never rides on color alone.
 */
export default function BudgetMeter({ spent, budget }) {
  if (budget === null || budget <= 0) return null

  const ratio = spent / budget
  const percent = Math.round(ratio * 100)
  const isOver = spent > budget
  const fillWidth = Math.min(100, Math.max(ratio * 100, spent > 0 ? 1.5 : 0))

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <p className="text-sm text-[var(--text-secondary)]">
          <span className="font-medium text-[var(--text-primary)] tabular-nums">{formatCurrency(spent)}</span>
          <span> of </span>
          <span className="tabular-nums">{formatCurrency(budget)}</span>
        </p>
        {isOver ? (
          <p className="flex items-center gap-1.5 text-sm font-medium" style={{ color: 'var(--critical)' }}>
            <AlertIcon />
            Over budget by {formatCurrency(spent - budget)}
          </p>
        ) : (
          <p className="text-sm tabular-nums text-[var(--text-muted)]">{percent}%</p>
        )}
      </div>

      <div
        className="h-2 w-full overflow-hidden rounded-full bg-[var(--surface-2)]"
        role="progressbar"
        aria-valuenow={Math.min(percent, 100)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${percent}% of monthly budget spent`}
      >
        <div
          className="h-full rounded-full transition-[width] duration-300"
          style={{
            width: `${fillWidth}%`,
            backgroundColor: isOver ? 'var(--critical)' : 'var(--positive)',
          }}
        />
      </div>
    </div>
  )
}
