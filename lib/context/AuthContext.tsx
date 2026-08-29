'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from 'firebase/auth'
import { auth, googleProvider, isFirebaseConfigured } from '@/lib/firebase/config'
import { firestoreService } from '@/lib/firebase/firestore-service'
import { dbService } from '@/lib/supabase/db-service'
import type { Profile } from '@/lib/supabase/database.types'

export interface UserSession {
  id: string
  email: string
  displayName?: string | null
  photoURL?: string | null
}

interface AuthContextType {
  user: UserSession | null
  profile: Profile | null
  isLoading: boolean
  signIn: (email: string, pass: string) => Promise<{ error?: string }>
  signUp: (email: string, pass: string, businessName: string) => Promise<{ error?: string }>
  signInWithGoogle: () => Promise<{ error?: string }>
  signOut: () => Promise<void>
  loginDemoUser: () => void
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const DEMO_USER: UserSession = {
  id: 'demo-user-id',
  email: 'alex@riveradesign.co',
  displayName: 'Alex Rivera',
  photoURL: null,
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      if (isFirebaseConfigured) {
        const p = await firestoreService.getProfile(userId)
        if (p) {
          setProfile(p)
          return
        }
      }
      const p = await dbService.getProfile(userId)
      setProfile(p)
    } catch (e) {
      console.error('Failed to load profile:', e)
    }
  }, [])

  useEffect(() => {
    if (isFirebaseConfigured) {
      const unsubscribe = onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
        if (fbUser) {
          const userSession: UserSession = {
            id: fbUser.uid,
            email: fbUser.email || '',
            displayName: fbUser.displayName,
            photoURL: fbUser.photoURL,
          }
          setUser(userSession)
          await fetchProfile(fbUser.uid)
        } else {
          // Check if demo user was active
          const isDemo = localStorage.getItem('flowtrack_is_demo') === 'true'
          if (isDemo) {
            setUser(DEMO_USER)
            await fetchProfile(DEMO_USER.id)
          } else {
            setUser(null)
            setProfile(null)
          }
        }
        setIsLoading(false)
      })

      return () => unsubscribe()
    } else {
      // Fallback: local session demo engine
      const stored = localStorage.getItem('flowtrack_active_user')
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          setUser(parsed)
          fetchProfile(parsed.id)
        } catch {
          setUser(DEMO_USER)
          fetchProfile(DEMO_USER.id)
        }
      } else {
        setUser(DEMO_USER)
        fetchProfile(DEMO_USER.id)
      }
      setIsLoading(false)
    }
  }, [fetchProfile])

  const signIn = async (email: string, pass: string) => {
    try {
      if (isFirebaseConfigured) {
        const cred = await signInWithEmailAndPassword(auth, email, pass)
        const userSession: UserSession = {
          id: cred.user.uid,
          email: cred.user.email || '',
          displayName: cred.user.displayName,
        }
        setUser(userSession)
        await fetchProfile(cred.user.uid)
        localStorage.removeItem('flowtrack_is_demo')
        return {}
      }

      // Demo/Fallback Auth
      const demoUser: UserSession = {
        id: `user-${email.replace(/[^a-zA-Z0-9]/g, '')}`,
        email,
        displayName: email.split('@')[0],
      }
      setUser(demoUser)
      localStorage.setItem('flowtrack_active_user', JSON.stringify(demoUser))
      localStorage.removeItem('flowtrack_is_demo')
      await fetchProfile(demoUser.id)
      return {}
    } catch (err: any) {
      return { error: err.message || 'Failed to sign in' }
    }
  }

  const signUp = async (email: string, pass: string, businessName: string) => {
    try {
      if (isFirebaseConfigured) {
        const cred = await createUserWithEmailAndPassword(auth, email, pass)
        const userSession: UserSession = {
          id: cred.user.uid,
          email: cred.user.email || '',
          displayName: businessName,
        }
        setUser(userSession)
        // Automatically create user profile in Firestore
        await firestoreService.updateProfile(
          {
            business_name: businessName,
            business_email: email,
            currency: 'USD',
          },
          cred.user.uid
        )
        await fetchProfile(cred.user.uid)
        localStorage.removeItem('flowtrack_is_demo')
        return {}
      }

      // Demo/Fallback Sign Up
      const demoUser: UserSession = {
        id: `user-${Date.now()}`,
        email,
        displayName: businessName,
      }
      setUser(demoUser)
      localStorage.setItem('flowtrack_active_user', JSON.stringify(demoUser))
      localStorage.removeItem('flowtrack_is_demo')
      await dbService.updateProfile({ business_name: businessName, business_email: email }, demoUser.id)
      await fetchProfile(demoUser.id)
      return {}
    } catch (err: any) {
      return { error: err.message || 'Failed to create account' }
    }
  }

  const signInWithGoogle = async () => {
    try {
      if (isFirebaseConfigured) {
        const cred = await signInWithPopup(auth, googleProvider)
        const userSession: UserSession = {
          id: cred.user.uid,
          email: cred.user.email || '',
          displayName: cred.user.displayName,
          photoURL: cred.user.photoURL,
        }
        setUser(userSession)
        // Initialize profile if needed
        const currentProfile = await firestoreService.getProfile(cred.user.uid)
        if (!currentProfile) {
          await firestoreService.updateProfile(
            {
              business_name: cred.user.displayName || 'My Freelance Studio',
              business_email: cred.user.email || '',
              currency: 'USD',
            },
            cred.user.uid
          )
        }
        await fetchProfile(cred.user.uid)
        localStorage.removeItem('flowtrack_is_demo')
        return {}
      }

      // Fallback
      loginDemoUser()
      return {}
    } catch (err: any) {
      return { error: err.message || 'Google sign in failed' }
    }
  }

  const signOut = async () => {
    try {
      if (isFirebaseConfigured) {
        await firebaseSignOut(auth)
      }
      localStorage.removeItem('flowtrack_active_user')
      localStorage.removeItem('flowtrack_is_demo')
      setUser(null)
      setProfile(null)
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
    } catch (err) {
      console.error('Error signing out:', err)
    }
  }

  const loginDemoUser = () => {
    setUser(DEMO_USER)
    localStorage.setItem('flowtrack_active_user', JSON.stringify(DEMO_USER))
    localStorage.setItem('flowtrack_is_demo', 'true')
    fetchProfile(DEMO_USER.id)
  }

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isLoading,
        signIn,
        signUp,
        signInWithGoogle,
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
