'use client'

import React, { createContext, useContext, useEffect, useState, useRef } from 'react'

export type Theme = 'light' | 'dark'

interface ThemeTransitionState {
  isTransitioning: boolean
  targetTheme: Theme | null
  originX: number
  originY: number
}

interface ThemeContextType {
  theme: Theme
  toggleTheme: (event?: React.MouseEvent | MouseEvent) => void
  setTheme: (theme: Theme, event?: React.MouseEvent | MouseEvent) => void
  transitionState: ThemeTransitionState
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light')
  const [transitionState, setTransitionState] = useState<ThemeTransitionState>({
    isTransitioning: false,
    targetTheme: null,
    originX: typeof window !== 'undefined' ? window.innerWidth - 80 : 500,
    originY: 40,
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

  const setTheme = (t: Theme, event?: React.MouseEvent | MouseEvent) => {
    if (t === theme && !transitionState.isTransitioning) return

    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current)
    }

    let originX = typeof window !== 'undefined' ? window.innerWidth - 80 : 500
    let originY = 40

    if (event && event.clientX && event.clientY) {
      originX = event.clientX
      originY = event.clientY
    }

    // Step 1: Start organic liquid paint flood (1.4s total)
    setTransitionState({
      isTransitioning: true,
      targetTheme: t,
      originX,
      originY,
    })

    // Step 2: Swap the underlying DOM theme cleanly when paint has 100% engulfed screen (620ms)
    setTimeout(() => {
      setThemeState(t)
      applyThemeClass(t)
      localStorage.setItem('flowtrack_theme', t)
    }, 620)

    // Step 3: Complete paint settlement (1400ms)
    transitionTimeoutRef.current = setTimeout(() => {
      setTransitionState({
        isTransitioning: false,
        targetTheme: null,
        originX: typeof window !== 'undefined' ? window.innerWidth - 80 : 500,
        originY: 40,
      })
    }, 1400)
  }

  const toggleTheme = (event?: React.MouseEvent | MouseEvent) => {
    const next = theme === 'light' ? 'dark' : 'light'
    setTheme(next, event)
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
