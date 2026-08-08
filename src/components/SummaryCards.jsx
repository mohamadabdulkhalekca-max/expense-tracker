import { useEffect, useRef, useState } from 'react'
import { formatCurrency } from '../lib/format'
import { PencilIcon } from './icons'

function Tile({ label, children, hint }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">{label}</p>
      {children}
      {hint ? <p className="text-xs text-[var(--text-muted)]">{hint}</p> : null}
    </div>
  )
}

/**
 * Inline-editable budget. Click the value to edit; Enter or blur commits,
 * Escape reverts. This is the whole "set a monthly budget" flow, so the
 * affordance stays visible rather than hiding behind a settings screen.
 */
function BudgetField({ budget, onSetBudget }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    if (editing) inputRef.current?.select()
  }, [editing])

  function startEditing() {
    setDraft(budget === null ? '' : String(budget))
    setEditing(true)
  }

  function commit() {
    const trimmed = draft.trim()
    if (trimmed === '') {
      onSetBudget(null)
    } else {
      const amount = Number(trimmed)
      if (Number.isFinite(amount) && amount >= 0) onSetBudget(amount)
    }
    setEditing(false)
  }

  if (editing) {
    return (
      <div className="flex items-center gap-1 text-2xl font-semibold">
        <span className="text-[var(--text-muted)]">$</span>
        <input
          ref={inputRef}
          type="number"
          min="0"
          step="0.01"
          inputMode="decimal"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commit()
            if (e.key === 'Escape') setEditing(false)
          }}
          aria-label="Monthly budget"
          className="w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--surface-2)] px-2 py-0.5 text-2xl font-semibold outline-none"
        />
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={startEditing}
      className="group flex items-center gap-1.5 text-left"
      aria-label={budget === null ? 'Set monthly budget' : `Monthly budget ${formatCurrency(budget)}. Edit`}
    >
      <span
        className={`text-2xl font-semibold ${budget === null ? 'text-[var(--text-muted)]' : ''}`}
      >
        {budget === null ? 'Set budget' : formatCurrency(budget)}
      </span>
      <span className="text-[var(--text-muted)] opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
        <PencilIcon />
      </span>
    </button>
  )
}

export default function SummaryCards({ spent, budget, onSetBudget, monthLabel }) {
  const remaining = budget === null ? null : budget - spent
  const isOver = remaining !== null && remaining < 0

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
      <Tile label="Spent" hint={monthLabel}>
        <p className="text-2xl font-semibold">{formatCurrency(spent)}</p>
      </Tile>

      {/* The hero figure: the number this app exists to answer. */}
      <Tile
        label={isOver ? 'Over budget' : 'Remaining'}
        hint={budget === null ? 'Set a budget to track this' : undefined}
      >
        <p
          className="text-4xl font-semibold tracking-tight"
          style={isOver ? { color: 'var(--critical)' } : undefined}
        >
          {remaining === null ? '—' : formatCurrency(Math.abs(remaining))}
        </p>
        {isOver ? (
          <p className="text-xs font-medium" style={{ color: 'var(--critical)' }}>
            over budget
          </p>
        ) : null}
      </Tile>

      <Tile label="Monthly budget" hint="Applies to every month">
        <BudgetField budget={budget} onSetBudget={onSetBudget} />
      </Tile>
    </div>
  )
}
