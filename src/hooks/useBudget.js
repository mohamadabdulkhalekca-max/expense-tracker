import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

/**
 * One budget row per (user, month). A missing row means "not set yet",
 * which the UI treats differently from a budget of 0 -- preserve that
 * distinction, don't default to 0.
 */
export function useBudget(userId, month) {
  const [budget, setBudgetState] = useState(null)

  // Guards against a slow refresh() resolving after a more recent mutation
  // (or a switch to a different month) and clobbering it with stale data --
  // every state-changing call bumps this, and a refresh whose sequence
  // number has been superseded by the time it resolves is dropped.
  const requestSeq = useRef(0)

  const refresh = useCallback(async () => {
    const seq = ++requestSeq.current
    if (!userId || !month) {
      setBudgetState(null)
      return
    }
    const { data, error } = await supabase
      .from('budgets')
      .select('amount')
      .eq('user_id', userId)
      .eq('month', month)
      .maybeSingle()
    if (seq !== requestSeq.current) return
    if (!error) setBudgetState(data?.amount ?? null)
    else console.error('Failed to load budget', error)
  }, [userId, month])

  useEffect(() => {
    refresh()
  }, [refresh])

  const setBudget = useCallback(
    async (value) => {
      if (!userId || !month) return
      requestSeq.current += 1

      if (value === null || value === '') {
        setBudgetState(null)
        const { error } = await supabase
          .from('budgets')
          .delete()
          .eq('user_id', userId)
          .eq('month', month)
        if (error) console.error('Failed to clear budget', error)
        return
      }

      const amount = Number(value)
      if (!Number.isFinite(amount) || amount < 0) return
      const rounded = Math.round(amount * 100) / 100

      setBudgetState(rounded)
      const { error } = await supabase
        .from('budgets')
        .upsert({ user_id: userId, month, amount: rounded }, { onConflict: 'user_id,month' })
      if (error) console.error('Failed to save budget', error)
    },
    [userId, month],
  )

  return { budget, setBudget, refresh }
}
