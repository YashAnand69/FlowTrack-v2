'use client'

import React, { createContext, useContext, useEffect, useState, useRef } from 'react'

export type Theme = 'light' | 'dark'

interface ThemeTransitionState {
  isTransitioning: boolean
  targetTheme: Theme | null
}

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
  transitionState: ThemeTransitionState
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light')
  const [transitionState, setTransitionState] = useState<ThemeTransitionState>({
    isTransitioning: false,
    targetTheme: null,
  })
  const transitionTimeoutRef = useRef<any>(null)

  useEffect(() => {
    const stored = localStorage.getItem('flowtrack_theme') as Theme | null
    if (stored === 'light' || stored === 'dark') {
      setThemeState(stored)
      applyThemeClass(stored)
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setThemeState('dark')
      applyThemeClass('dark')
    } else {
      setThemeState('light')
      applyThemeClass('light')
    }
  }, [])

  const applyThemeClass = (t: Theme) => {
    const root = document.documentElement
    if (t === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }

  const setTheme = (t: Theme) => {
    if (t === theme && !transitionState.isTransitioning) return

    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current)
    }

    // Step 1: Start calm liquid ripple transition
    setTransitionState({
      isTransitioning: true,
      targetTheme: t,
    })

    // Step 2: Swap the underlying DOM theme cleanly at peak ripple coverage (180ms)
    setTimeout(() => {
      setThemeState(t)
      applyThemeClass(t)
      localStorage.setItem('flowtrack_theme', t)
    }, 180)

    // Step 3: Dismiss calm ripple smoothly (620ms)
    transitionTimeoutRef.current = setTimeout(() => {
      setTransitionState({
        isTransitioning: false,
        targetTheme: null,
      })
    }, 620)
  }

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light'
    setTheme(next)
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, transitionState }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
