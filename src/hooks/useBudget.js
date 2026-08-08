import { useCallback, useEffect, useState } from 'react'
import { KEYS, load, save } from '../lib/storage'

/**
 * One monthly budget amount, applied to every month. `null` means "not set
 * yet", which the UI treats differently from a budget of 0.
 */
export function useBudget() {
  const [budget, setBudgetState] = useState(() => {
    const stored = load(KEYS.budget, null)
    return Number.isFinite(stored) && stored >= 0 ? stored : null
  })

  useEffect(() => {
    save(KEYS.budget, budget)
  }, [budget])

  const setBudget = useCallback((value) => {
    if (value === null || value === '') {
      setBudgetState(null)
      return
    }
    const amount = Number(value)
    if (!Number.isFinite(amount) || amount < 0) return
    setBudgetState(Math.round(amount * 100) / 100)
  }, [])

  return { budget, setBudget }
}
