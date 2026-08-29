'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/context/AuthContext'

export default function RootPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        router.replace('/dashboard')
      } else {
        router.replace('/login')
      }
    }
  }, [user, isLoading, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafafa] dark:bg-[#0a0a0a]">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-indigo-600 animate-pulse flex items-center justify-center text-white font-bold">
          FT
        </div>
        <span className="text-sm font-semibold text-slate-500">Loading FlowTrack...</span>
      </div>
    </div>
  )
}
