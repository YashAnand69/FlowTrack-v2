'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client'
import { dbService } from '@/lib/supabase/db-service'
import type { Profile } from '@/lib/supabase/database.types'
import type { User, Session } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: Profile | null
  isLoading: boolean
  isDemoMode: boolean
  signIn: (email: string, pass: string) => Promise<{ error: string | null }>
  signUp: (email: string, pass: string, businessName?: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  loginDemoUser: () => void
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const DEMO_USER: User = {
  id: 'demo-user-id',
  app_metadata: {},
  user_metadata: { business_name: 'Rivera Design Studio' },
  aud: 'authenticated',
  created_at: new Date().toISOString(),
  email: 'alex@riveradesign.co',
} as User

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDemoMode, setIsDemoMode] = useState(false)
  const router = useRouter()

  const loadProfile = useCallback(async (userId?: string) => {
    try {
      const p = await dbService.getProfile(userId)
      setProfile(p)
    } catch (e) {
      console.error('Error loading profile:', e)
    }
  }, [])

  useEffect(() => {
    async function initAuth() {
      setIsLoading(true)

      // 1. Check if user saved demo session
      const savedDemo = typeof window !== 'undefined' ? localStorage.getItem('flowtrack_demo_session') : null
      if (savedDemo === 'true') {
        setUser(DEMO_USER)
        setIsDemoMode(true)
        await loadProfile('demo-user-id')
        setIsLoading(false)
        return
      }

      // 2. Check Supabase
      if (isSupabaseConfigured && supabase) {
        try {
          const { data: { session: currentSession } } = await supabase.auth.getSession()
          if (currentSession) {
            setSession(currentSession)
            setUser(currentSession.user)
            await loadProfile(currentSession.user.id)
          } else {
            // Default to demo user if no auth session exists yet for effortless walkthrough
            setUser(DEMO_USER)
            setIsDemoMode(true)
            await loadProfile('demo-user-id')
          }
        } catch (e) {
          console.warn('Supabase auth session check fallback to demo:', e)
          setUser(DEMO_USER)
          setIsDemoMode(true)
          await loadProfile('demo-user-id')
        }
      } else {
        // Fallback demo user
        setUser(DEMO_USER)
        setIsDemoMode(true)
        await loadProfile('demo-user-id')
      }

      setIsLoading(false)
    }

    initAuth()

    if (isSupabaseConfigured && supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
        setSession(newSession)
        setUser(newSession?.user || null)
        if (newSession?.user) {
          setIsDemoMode(false)
          localStorage.removeItem('flowtrack_demo_session')
          await loadProfile(newSession.user.id)
        }
      })

      return () => {
        subscription.unsubscribe()
      }
    }
  }, [loadProfile])

  const signIn = async (email: string, pass: string): Promise<{ error: string | null }> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: pass,
      })
      if (error) return { error: error.message }
      if (data.user) {
        setUser(data.user)
        setIsDemoMode(false)
        localStorage.removeItem('flowtrack_demo_session')
        await loadProfile(data.user.id)
        router.push('/dashboard')
      }
      return { error: null }
    }

    // Demo sign in
    loginDemoUser()
    router.push('/dashboard')
    return { error: null }
  }

  const signUp = async (email: string, pass: string, businessName?: string): Promise<{ error: string | null }> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: pass,
        options: {
          data: {
            business_name: businessName || 'My Freelance Business',
          },
        },
      })
      if (error) return { error: error.message }
      if (data.user) {
        setUser(data.user)
        setIsDemoMode(false)
        localStorage.removeItem('flowtrack_demo_session')
        await loadProfile(data.user.id)
        router.push('/dashboard')
      }
      return { error: null }
    }

    // Demo sign up
    loginDemoUser()
    if (businessName) {
      await dbService.updateProfile({ business_name: businessName, business_email: email })
      await loadProfile('demo-user-id')
    }
    router.push('/dashboard')
    return { error: null }
  }

  const signOut = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut()
    }
    localStorage.removeItem('flowtrack_demo_session')
    setUser(null)
    setSession(null)
    setProfile(null)
    setIsDemoMode(false)
    router.push('/login')
  }

  const loginDemoUser = () => {
    localStorage.setItem('flowtrack_demo_session', 'true')
    setUser(DEMO_USER)
    setIsDemoMode(true)
    loadProfile('demo-user-id')
  }

  const refreshProfile = async () => {
    await loadProfile(user?.id)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        isLoading,
        isDemoMode,
        signIn,
        signUp,
        signOut,
        loginDemoUser,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
