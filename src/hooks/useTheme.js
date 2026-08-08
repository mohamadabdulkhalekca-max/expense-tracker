import { useCallback, useEffect, useState } from 'react'
import { KEYS, load, save } from '../lib/storage'

function initialTheme() {
  const stored = load(KEYS.theme, null)
  if (stored === 'light' || stored === 'dark') return stored
  const prefersDark =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  return prefersDark ? 'dark' : 'light'
}

/**
 * Light/dark theme. The class goes on <html> to match Tailwind's
 * `darkMode: 'class'`; index.html applies the same class before first paint so
 * a dark-mode reload doesn't flash white.
 */
export function useTheme() {
  const [theme, setTheme] = useState(initialTheme)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    save(KEYS.theme, theme)
  }, [theme])

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }, [])

  return { theme, toggleTheme }
}
