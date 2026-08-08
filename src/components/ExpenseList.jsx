import { useEffect, useMemo, useRef, useState } from 'react'
import { categoryColor, getCategory } from '../lib/categories'
import { formatCurrency, formatDateHeading } from '../lib/format'
import EmptyState from './EmptyState'
import ExpenseForm from './ExpenseForm'
import { PencilIcon, TrashIcon } from './icons'

const rowAction =
  'rounded-md p-1.5 text-[var(--text-muted)] opacity-0 transition-all focus-visible:opacity-100 group-hover:opacity-100'

/** Delete asks for a second click within 3s — an undo without the undo bar. */
function DeleteButton({ onDelete, expenseName }) {
  const [armed, setArmed] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => () => clearTimeout(timerRef.current), [])

  function handleClick() {
    if (armed) {
      clearTimeout(timerRef.current)
      onDelete()
      return
    }
    setArmed(true)
    timerRef.current = setTimeout(() => setArmed(false), 3000)
  }

  if (armed) {
    return (
      <button
        type="button"
        onClick={handleClick}
        onBlur={() => setArmed(false)}
        className="rounded-md px-2 py-1 text-xs font-medium transition-colors"
        style={{ color: 'var(--critical)', backgroundColor: 'var(--surface-2)' }}
        aria-label={`Confirm delete ${expenseName}`}
      >
        Confirm
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`${rowAction} hover:text-[var(--critical)]`}
      aria-label={`Delete ${expenseName}`}
    >
      <TrashIcon />
    </button>
  )
}

function ExpenseRow({ expense, onDelete, onStartEdit }) {
  const category = getCategory(expense.category)

  return (
    <div className="group flex items-center gap-3 rounded-lg px-1 py-2.5 transition-colors hover:bg-[var(--surface-2)]">
      {/* Reinforcement only — the category name is always present as text. */}
      <span
        className="h-2.5 w-2.5 shrink-0 rounded-full"
        style={{ backgroundColor: categoryColor(expense.category) }}
        aria-hidden="true"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{expense.name}</p>
        <p className="truncate text-xs text-[var(--text-muted)]">{category.label}</p>
      </div>
      <span className="shrink-0 text-sm font-medium tabular-nums">{formatCurrency(expense.amount)}</span>
      <button
        type="button"
        onClick={onStartEdit}
        className={`${rowAction} hover:text-[var(--text-primary)]`}
        aria-label={`Edit ${expense.name}`}
      >
        <PencilIcon />
      </button>
      <DeleteButton onDelete={onDelete} expenseName={expense.name} />
    </div>
  )
}

export default function ExpenseList({ expenses, onDelete, onUpdate }) {
  const [editingId, setEditingId] = useState(null)

  // Newest first, grouped under date headings.
  const groups = useMemo(() => {
    const byDate = new Map()
    for (const expense of expenses) {
      if (!byDate.has(expense.date)) byDate.set(expense.date, [])
      byDate.get(expense.date).push(expense)
    }
    return [...byDate.entries()]
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([date, rows]) => ({
        date,
        rows: [...rows].sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0)),
        total: rows.reduce((sum, r) => sum + r.amount, 0),
      }))
  }, [expenses])

  if (expenses.length === 0) {
    return <EmptyState title="No expenses this month" hint="Add one with the form above to get started." />
  }

  return (
    <div className="flex flex-col gap-5">
      {groups.map((group) => (
        <section key={group.date} className="flex flex-col gap-1">
          <div className="flex items-baseline justify-between gap-3 px-1 pb-1">
            <h3 className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
              {formatDateHeading(group.date)}
            </h3>
            <span className="text-xs tabular-nums text-[var(--text-muted)]">{formatCurrency(group.total)}</span>
          </div>

          <ul className="flex flex-col">
            {group.rows.map((expense) => (
              <li key={expense.id}>
                {editingId === expense.id ? (
                  // The row expands into the same form used for adding, seeded
                  // with this expense — every field is editable.
                  <div className="my-1 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
                    <p className="mb-3 text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
                      Edit expense
                    </p>
                    <ExpenseForm
                      initialValues={{
                        name: expense.name,
                        amount: expense.amount,
                        category: expense.category,
                        date: expense.date,
                      }}
                      submitLabel="Save changes"
                      autoFocus
                      onCancel={() => setEditingId(null)}
                      onSubmit={(values) => {
                        onUpdate(expense.id, values)
                        setEditingId(null)
                      }}
                    />
                  </div>
                ) : (
                  <ExpenseRow
                    expense={expense}
                    onDelete={() => onDelete(expense.id)}
                    onStartEdit={() => setEditingId(expense.id)}
                  />
                )}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
