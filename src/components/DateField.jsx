import { useEffect, useId, useRef, useState } from 'react'
import { formatDateShort, formatMonthLabel, monthKeyOf, shiftMonth, toISODate } from '../lib/format'

const WEEKDAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

function CalendarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="2.5" y="3.5" width="11" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M2.5 6.5h11M5.5 2v2.5M10.5 2v2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}

function ChevronLeft() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M10 3.5 5.5 8l4.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ChevronRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M6 3.5 10.5 8 6 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/** The 42 cells (6 full weeks) needed to render `monthKey`, including leading/trailing days from adjacent months. */
function buildGrid(monthKey) {
  const [y, m] = monthKey.split('-').map(Number)
  const firstOfMonth = new Date(y, m - 1, 1)
  const gridStart = new Date(y, m - 1, 1 - firstOfMonth.getDay())
  return Array.from({ length: 42 }, (_, i) => {
    const date = new Date(gridStart)
    date.setDate(gridStart.getDate() + i)
    return date
  })
}

/**
 * A custom-styled replacement for the native `<input type="date">`, whose
 * OS-chrome calendar widget can't be themed to match the rest of the form
 * and renders the date in whatever format the visitor's locale happens to
 * use. This always displays an unambiguous 'Aug 20, 2026' and matches the
 * app's own surface/border/accent tokens in both light and dark.
 */
export default function DateField({ id, value, onChange }) {
  const uid = useId()
  const popoverId = `${uid}-popover`
  const [open, setOpen] = useState(false)
  const [viewMonth, setViewMonth] = useState(() => monthKeyOf(value || toISODate()))
  const rootRef = useRef(null)
  const triggerRef = useRef(null)

  useEffect(() => {
    if (!open) return
    setViewMonth(monthKeyOf(value || toISODate()))

    function handlePointerDown(event) {
      if (rootRef.current && !rootRef.current.contains(event.target)) setOpen(false)
    }
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setOpen(false)
        triggerRef.current?.focus()
      }
    }
    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  function selectDate(date) {
    onChange(toISODate(date))
    setOpen(false)
    triggerRef.current?.focus()
  }

  const grid = buildGrid(viewMonth)
  const today = toISODate()

  return (
    <div className="relative" ref={rootRef}>
      <button
        id={id}
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? popoverId : undefined}
        className="flex w-full items-center justify-between gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-left text-sm outline-none transition-colors focus:border-[var(--accent)]"
      >
        <span className="tabular-nums">{value ? formatDateShort(value) : 'Select date'}</span>
        <span className="text-[var(--text-muted)]">
          <CalendarIcon />
        </span>
      </button>

      {open ? (
        <div
          id={popoverId}
          role="dialog"
          aria-label="Choose date"
          className="absolute z-20 mt-1.5 w-72 rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-3 shadow-lg"
        >
          <div className="flex items-center justify-between pb-2">
            <button
              type="button"
              onClick={() => setViewMonth((m) => shiftMonth(m, -1))}
              aria-label="Previous month"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-2)]"
            >
              <ChevronLeft />
            </button>
            <span className="font-display text-sm font-medium">{formatMonthLabel(viewMonth)}</span>
            <button
              type="button"
              onClick={() => setViewMonth((m) => shiftMonth(m, 1))}
              aria-label="Next month"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-2)]"
            >
              <ChevronRight />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 pb-1 text-center text-[11px] font-medium uppercase text-[var(--text-muted)]">
            {WEEKDAY_LABELS.map((label, i) => (
              // Two Sundays/etc. would collide as React keys since the label alone repeats each week.
              <span key={i}>{label}</span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {grid.map((date) => {
              const iso = toISODate(date)
              const inMonth = monthKeyOf(iso) === viewMonth
              const isSelected = iso === value
              const isToday = iso === today

              return (
                <button
                  key={iso}
                  type="button"
                  onClick={() => selectDate(date)}
                  aria-label={formatDateShort(iso)}
                  aria-current={isToday ? 'date' : undefined}
                  className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm tabular-nums transition-colors ${
                    isSelected ? 'font-semibold text-white' : 'hover:bg-[var(--surface-2)]'
                  } ${!inMonth ? 'text-[var(--text-muted)] opacity-50' : 'text-[var(--text-primary)]'}`}
                  style={{
                    backgroundColor: isSelected ? 'var(--accent)' : undefined,
                    boxShadow: isToday && !isSelected ? 'inset 0 0 0 1.5px var(--accent)' : undefined,
                  }}
                >
                  {date.getDate()}
                </button>
              )
            })}
          </div>

          <button
            type="button"
            onClick={() => selectDate(new Date())}
            className="mt-2 w-full rounded-lg py-1.5 text-center text-xs font-medium transition-colors hover:bg-[var(--surface-2)]"
            style={{ color: 'var(--accent)' }}
          >
            Today
          </button>
        </div>
      ) : null}
    </div>
  )
}
