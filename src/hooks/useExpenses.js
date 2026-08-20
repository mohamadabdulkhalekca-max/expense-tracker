import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

function fromRow(row) {
  return {
    id: row.id,
    name: row.name,
    amount: row.amount,
    category: row.category,
    date: row.date,
    createdAt: new Date(row.created_at).getTime(),
  }
}

/**
 * Expense list + Supabase persistence, scoped to `userId` (RLS also enforces
 * this server-side). Same row shape as before Supabase replaced localStorage
 * -- this is the seam a real backend swaps in without any component changing.
 */
export function useExpenses(userId) {
  const [expenses, setExpenses] = useState([])

  // Guards against a slow refresh() resolving after a more recent mutation
  // and clobbering it with stale data -- every state-changing call bumps
  // this, and a refresh whose sequence number has been superseded by the
  // time it resolves is dropped instead of applied.
  const requestSeq = useRef(0)

  const refresh = useCallback(async () => {
    const seq = ++requestSeq.current
    if (!userId) {
      setExpenses([])
      return
    }
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
    if (seq !== requestSeq.current) return
    if (!error) setExpenses((data ?? []).map(fromRow))
    else console.error('Failed to load expenses', error)
  }, [userId])

  useEffect(() => {
    refresh()
  }, [refresh])

  const addExpense = useCallback(
    async ({ name, amount, category, date }) => {
      requestSeq.current += 1
      const { data, error } = await supabase
        .from('expenses')
        .insert({
          user_id: userId,
          name: name.trim(),
          amount: Math.round(Number(amount) * 100) / 100,
          category,
          date,
        })
        .select()
        .single()
      if (error) {
        console.error('Failed to add expense', error)
        return
      }
      const expense = fromRow(data)
      setExpenses((prev) => [expense, ...prev])
      return expense
    },
    [userId],
  )

  /** Replace an expense's editable fields. `id` and `createdAt` are preserved. */
  const updateExpense = useCallback(async (id, { name, amount, category, date }) => {
    requestSeq.current += 1
    const patch = {
      name: name.trim(),
      amount: Math.round(Number(amount) * 100) / 100,
      category,
      date,
    }
    const { error } = await supabase.from('expenses').update(patch).eq('id', id)
    if (error) {
      console.error('Failed to update expense', error)
      return
    }
    setExpenses((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)))
  }, [])

  const deleteExpense = useCallback(async (id) => {
    requestSeq.current += 1
    const { error } = await supabase.from('expenses').delete().eq('id', id)
    if (error) {
      console.error('Failed to delete expense', error)
      return
    }
    setExpenses((prev) => prev.filter((e) => e.id !== id))
  }, [])

  return { expenses, addExpense, updateExpense, deleteExpense, refresh }
}
