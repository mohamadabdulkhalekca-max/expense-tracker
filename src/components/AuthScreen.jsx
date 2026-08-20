import { useId, useState } from 'react'

const fieldLabel = 'text-xs font-medium text-[var(--text-secondary)]'
const field =
  'w-full rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm outline-none transition-colors placeholder:text-[var(--text-muted)] focus:border-[var(--accent)]'

/** Email/password sign-in and sign-up, toggled by `mode`. Gates the whole app in App.jsx. */
export default function AuthScreen({ onSignIn, onSignUp }) {
  const uid = useId()
  const [mode, setMode] = useState('signIn')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const isSignUp = mode === 'signUp'

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setInfo('')
    setSubmitting(true)

    const { data, error: authError } = isSignUp
      ? await onSignUp(email, password)
      : await onSignIn(email, password)

    setSubmitting(false)
    if (authError) {
      setError(authError.message)
      return
    }
    // A session on the sign-up response means email confirmation is off and
    // the user is already logged in -- App.jsx swaps this screen out on its
    // own, so there's nothing to tell them. Only show the message when
    // confirmation is actually pending (no session yet).
    if (isSignUp && !data?.session) {
      setInfo('Check your email to confirm your account, then sign in.')
    }
  }

  return (
    <div className="flex min-h-full items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] p-6">
        <h1 className="font-display text-lg font-semibold tracking-tight">
          {isSignUp ? 'Create an account' : 'Welcome back'}
        </h1>
        <p className="mt-0.5 text-sm text-[var(--text-muted)]">
          {isSignUp ? 'Sign up to start tracking expenses.' : 'Sign in to your expense tracker.'}
        </p>

        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-1.5">
            <label className={fieldLabel} htmlFor={`${uid}-email`}>
              Email
            </label>
            <input
              id={`${uid}-email`}
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className={field}
              autoComplete="email"
              autoFocus
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={fieldLabel} htmlFor={`${uid}-password`}>
              Password
            </label>
            <input
              id={`${uid}-password`}
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className={field}
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
            />
          </div>

          {error ? (
            <p className="text-xs" style={{ color: 'var(--critical)' }} role="alert">
              {error}
            </p>
          ) : null}
          {info ? (
            <p className="text-xs text-[var(--text-secondary)]" role="status">
              {info}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={submitting || !email || !password}
            className="rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            {submitting ? 'Please wait…' : isSignUp ? 'Sign up' : 'Sign in'}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setMode(isSignUp ? 'signIn' : 'signUp')
            setError('')
            setInfo('')
          }}
          className="mt-4 text-xs text-[var(--text-secondary)] underline-offset-2 hover:underline"
        >
          {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
        </button>
      </div>
    </div>
  )
}
