'use client'

import { useTheme } from '@/lib/providers/ThemeProvider'
import { Moon, Sun } from 'lucide-react'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className="relative inline-flex items-center justify-center w-12 h-12 rounded-full
                 bg-seahawks-grey/20 hover:bg-seahawks-grey/30
                 dark:bg-seahawks-grey/10 dark:hover:bg-seahawks-grey/20
                 transition-all duration-200 group"
      aria-label="Toggle theme"
    >
      <Sun className="h-5 w-5 text-seahawks-navy dark:text-transparent dark:scale-0
                      transition-all duration-300 absolute" />
      <Moon className="h-5 w-5 text-transparent scale-0 dark:text-seahawks-green dark:scale-100
                       transition-all duration-300 absolute" />
    </button>
  )
}
