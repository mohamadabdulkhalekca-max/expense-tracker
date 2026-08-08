import { formatMonthLabel, shiftMonth, toMonthKey } from '../lib/format'

function ChevronLeft() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M10 3.5 5.5 8l4.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ChevronRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M6 3.5 10.5 8 6 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="4.25" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.2 5.2l1.4 1.4M17.4 17.4l1.4 1.4M18.8 5.2l-1.4 1.4M6.6 17.4l-1.4 1.4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M20 14.2A8.2 8.2 0 0 1 9.8 4a8.2 8.2 0 1 0 10.2 10.2Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  )
}

const navButton =
  'flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-2)] disabled:pointer-events-none disabled:opacity-35'

export default function Header({ month, onMonthChange, theme, onToggleTheme, userName }) {
  // There is nothing to see in the future, so forward stops at the current month.
  const atCurrentMonth = month >= toMonthKey()

  return (
    <header className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">
          {userName ? `Hello, ${userName}` : 'Hello'}
        </h1>
        <p className="mt-0.5 text-sm text-[var(--text-muted)]">Track spending against a monthly budget</p>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-1">
          <button type="button" className={navButton} onClick={() => onMonthChange(shiftMonth(month, -1))} aria-label="Previous month">
            <ChevronLeft />
          </button>
          <span className="min-w-[8.5rem] text-center text-sm font-medium" aria-live="polite">
            {formatMonthLabel(month)}
          </span>
          <button
            type="button"
            className={navButton}
            onClick={() => onMonthChange(shiftMonth(month, 1))}
            disabled={atCurrentMonth}
            aria-label="Next month"
          >
            <ChevronRight />
          </button>
        </div>

        <button
          type="button"
          onClick={onToggleTheme}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface-1)] text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-2)]"
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
        </button>
      </div>
    </header>
  )
}
