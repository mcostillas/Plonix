'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-hooks'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light')
  const [mounted, setMounted] = useState(false)
  const { user } = useAuth()

  // Load theme from database when user logs in
  useEffect(() => {
    async function loadTheme() {
      if (!user?.id) {
        // TODO: Dark mode under works - Force light mode for now
        // Clear any saved dark mode preference
        localStorage.removeItem('plounix_theme')
        setThemeState('light')
        applyTheme('light')
        setMounted(true)
        return
      }

      try {
        const { data } = await supabase
          .from('user_profiles')
          .select('preferences')
          .eq('user_id', user.id)
          .maybeSingle()

        // TODO: Dark mode under works - Force light mode for now
        const prefs = (data as any)?.preferences || {}
        const savedTheme = 'light' // Force light mode
        setThemeState(savedTheme)
        applyTheme(savedTheme)
        
        // Clear localStorage as well
        localStorage.removeItem('plounix_theme')
      } catch (error) {
        console.error('Error loading theme:', error)
      } finally {
        setMounted(true)
      }
    }

    loadTheme()
  }, [user?.id])

  // Apply theme to document
  const applyTheme = (newTheme: Theme) => {
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  // Save theme to database and apply
  const setTheme = async (newTheme: Theme) => {
    // TODO: Dark mode under works - Force light mode only
    const forcedTheme = 'light'
    setThemeState(forcedTheme)
    applyTheme(forcedTheme)

    // Don't save theme preferences while dark mode is under works
    return
  }

  const toggleTheme = () => {
    // TODO: Dark mode under works - Force light mode only
    setTheme('light')
  }

  // Prevent flash of unstyled content
  if (!mounted) {
    return <>{children}</>
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
