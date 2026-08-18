import { useCallback, useEffect, useState } from 'react'
import { supabase, supabaseConfigured } from '../lib/supabaseClient'

/** Supabase session state plus the three auth actions the app needs. */
export function useAuth() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(supabaseConfigured)

  useEffect(() => {
    if (!supabaseConfigured) return

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUp = useCallback(
    (email, password) => supabase.auth.signUp({ email, password }),
    [],
  )
  const signIn = useCallback(
    (email, password) => supabase.auth.signInWithPassword({ email, password }),
    [],
  )
  const signOut = useCallback(() => supabase.auth.signOut(), [])

  return { session, user: session?.user ?? null, loading, signUp, signIn, signOut }
}
