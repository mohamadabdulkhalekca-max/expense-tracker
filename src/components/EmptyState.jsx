export default function EmptyState({ title, hint, className = '' }) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-1 px-6 py-10 text-center ${className}`}
    >
      <p className="text-sm font-medium text-[var(--text-secondary)]">{title}</p>
      {hint ? <p className="text-sm text-[var(--text-muted)]">{hint}</p> : null}
    </div>
  )
}
