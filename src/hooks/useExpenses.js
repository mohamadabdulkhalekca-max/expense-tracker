import { useCallback, useEffect, useState } from 'react'
import { KEYS, load, save } from '../lib/storage'

/** localStorage can hold anything; only keep rows that still look like expenses. */
function sanitize(rows) {
  if (!Array.isArray(rows)) return []
  return rows.filter(
    (r) =>
      r &&
      typeof r.id === 'string' &&
      typeof r.name === 'string' &&
      typeof r.date === 'string' &&
      Number.isFinite(r.amount),
  )
}

function newId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

/**
 * Expense list + persistence. Deliberately thin — this is the seam a real
 * backend would replace without any component changing.
 */
export function useExpenses() {
  const [expenses, setExpenses] = useState(() => sanitize(load(KEYS.expenses, [])))

  useEffect(() => {
    save(KEYS.expenses, expenses)
  }, [expenses])

  const addExpense = useCallback(({ name, amount, category, date }) => {
    const expense = {
      id: newId(),
      name: name.trim(),
      amount: Math.round(Number(amount) * 100) / 100,
      category,
      date,
      createdAt: Date.now(),
    }
    setExpenses((prev) => [expense, ...prev])
    return expense
  }, [])

  /** Replace an expense's editable fields. `id` and `createdAt` are preserved. */
  const updateExpense = useCallback((id, { name, amount, category, date }) => {
    setExpenses((prev) =>
      prev.map((e) =>
        e.id === id
          ? {
              ...e,
              name: name.trim(),
              amount: Math.round(Number(amount) * 100) / 100,
              category,
              date,
            }
          : e,
      ),
    )
  }, [])

  const deleteExpense = useCallback((id) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id))
  }, [])

  return { expenses, addExpense, updateExpense, deleteExpense }
}
