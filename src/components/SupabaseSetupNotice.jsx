/** Shown instead of a crash when VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY are missing. */
export default function SupabaseSetupNotice() {
  return (
    <div className="flex min-h-full items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] p-6">
        <h1 className="text-lg font-semibold tracking-tight">Supabase isn't configured yet</h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Copy <code>.env.example</code> to <code>.env.local</code>, fill in your Supabase
          project's URL and anon key from Settings → API, run{' '}
          <code>supabase/schema.sql</code> in the SQL editor, then restart the dev server.
        </p>
      </div>
    </div>
  )
}
