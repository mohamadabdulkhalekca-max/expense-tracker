import { useMemo, useState } from 'react'
import BudgetMeter from './components/BudgetMeter'
import CategoryDonut from './components/CategoryDonut'
import ExpenseForm from './components/ExpenseForm'
import ExpenseList from './components/ExpenseList'
import Header from './components/Header'
import SummaryCards from './components/SummaryCards'
import { useBudget } from './hooks/useBudget'
import { useExpenses } from './hooks/useExpenses'
import { useTheme } from './hooks/useTheme'
import { formatMonthLabel, monthKeyOf, toMonthKey } from './lib/format'

// Shown in the header greeting.
const USER_NAME = 'Mohamad'

function Card({ title, children, className = '' }) {
  return (
    <section
      className={`rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] p-5 sm:p-6 ${className}`}
    >
      {title ? <h2 className="mb-4 text-sm font-semibold">{title}</h2> : null}
      {children}
    </section>
  )
}

export default function App() {
  const { expenses, addExpense, updateExpense, deleteExpense } = useExpenses()
  const { budget, setBudget } = useBudget()
  const { theme, toggleTheme } = useTheme()
  const [month, setMonth] = useState(() => toMonthKey())

  // The single derived slice every section below reads from — the list, the
  // summary, the meter, and the chart never filter independently.
  const monthExpenses = useMemo(
    () => expenses.filter((e) => monthKeyOf(e.date) === month),
    [expenses, month],
  )

  const spent = useMemo(
    () => monthExpenses.reduce((sum, e) => sum + e.amount, 0),
    [monthExpenses],
  )

  // Follow an expense to its month so a back-dated entry is visibly added or
  // saved rather than disappearing into a month the user isn't looking at.
  function followMonth(date) {
    const target = monthKeyOf(date)
    if (target !== month) setMonth(target)
  }

  function handleAdd(expense) {
    addExpense(expense)
    followMonth(expense.date)
  }

  function handleUpdate(id, values) {
    updateExpense(id, values)
    followMonth(values.date)
  }

  return (
    <div className="min-h-full">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 px-4 py-8 sm:px-6 sm:py-10">
        <Header
          month={month}
          onMonthChange={setMonth}
          theme={theme}
          onToggleTheme={toggleTheme}
          userName={USER_NAME}
        />

        <Card>
          <div className="flex flex-col gap-6">
            <SummaryCards
              spent={spent}
              budget={budget}
              onSetBudget={setBudget}
              monthLabel={formatMonthLabel(month)}
            />
            <BudgetMeter spent={spent} budget={budget} />
          </div>
        </Card>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-5">
          <Card title="Spending by category" className="md:col-span-3">
            <CategoryDonut expenses={monthExpenses} />
          </Card>

          <Card title="Add expense" className="md:col-span-2">
            <ExpenseForm onSubmit={handleAdd} />
          </Card>
        </div>

        <Card title={`${formatMonthLabel(month)} expenses`}>
          <ExpenseList expenses={monthExpenses} onDelete={deleteExpense} onUpdate={handleUpdate} />
        </Card>
      </div>
    </div>
  )
}
