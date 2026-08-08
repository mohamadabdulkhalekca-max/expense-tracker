import { useId, useState } from 'react'
import { CATEGORIES, DEFAULT_CATEGORY_ID } from '../lib/categories'
import { toISODate } from '../lib/format'

const fieldLabel = 'text-xs font-medium text-[var(--text-secondary)]'
const field =
  'w-full rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm outline-none transition-colors placeholder:text-[var(--text-muted)] focus:border-[var(--accent)]'

/**
 * The one set of expense fields, used for both adding and editing.
 *
 * Add mode: no `initialValues`, no `onCancel` — submits and clears itself.
 * Edit mode: seeded with an existing expense and given `onCancel`, which also
 * turns on the Cancel button. The parent unmounts it after a save, so it does
 * not clear itself there.
 */
export default function ExpenseForm({
  onSubmit,
  initialValues,
  submitLabel = 'Add expense',
  onCancel,
  autoFocus = false,
}) {
  const isEdit = Boolean(initialValues)
  // Unique per instance so several forms can be on the page at once without
  // duplicate ids breaking label/input association.
  const uid = useId()

  const [name, setName] = useState(initialValues?.name ?? '')
  const [amount, setAmount] = useState(
    initialValues?.amount === undefined ? '' : String(initialValues.amount),
  )
  const [category, setCategory] = useState(initialValues?.category ?? DEFAULT_CATEGORY_ID)
  const [date, setDate] = useState(() => initialValues?.date ?? toISODate())
  const [error, setError] = useState('')

  const parsedAmount = Number(amount)
  const canSubmit =
    name.trim() !== '' && amount.trim() !== '' && Number.isFinite(parsedAmount) && parsedAmount > 0

  function handleSubmit(event) {
    event.preventDefault()
    if (name.trim() === '') {
      setError('Give the expense a name.')
      return
    }
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setError('Enter an amount greater than zero.')
      return
    }

    onSubmit({ name, amount: parsedAmount, category, date })
    if (isEdit) return

    // Keep the date so consecutive entries for the same day are fast.
    setName('')
    setAmount('')
    setError('')
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <div className="flex flex-col gap-1.5">
        <label className={fieldLabel} htmlFor={`${uid}-name`}>
          Name
        </label>
        <input
          id={`${uid}-name`}
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value)
            setError('')
          }}
          placeholder="Groceries"
          className={field}
          autoComplete="off"
          autoFocus={autoFocus}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className={fieldLabel} htmlFor={`${uid}-amount`}>
            Amount
          </label>
          <input
            id={`${uid}-amount`}
            type="number"
            min="0"
            step="0.01"
            inputMode="decimal"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value)
              setError('')
            }}
            placeholder="0.00"
            className={`${field} tabular-nums`}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={fieldLabel} htmlFor={`${uid}-date`}>
            Date
          </label>
          <input
            id={`${uid}-date`}
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={field}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={fieldLabel} htmlFor={`${uid}-category`}>
          Category
        </label>
        <select
          id={`${uid}-category`}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className={field}
        >
          {CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      {error ? (
        <p className="text-xs" style={{ color: 'var(--critical)' }} role="alert">
          {error}
        </p>
      ) : null}

      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={!canSubmit}
          className="flex-1 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          style={{ backgroundColor: 'var(--accent)' }}
        >
          {submitLabel}
        </button>
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-[var(--border)] px-4 py-2.5 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-2)]"
          >
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  )
}
