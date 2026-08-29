'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowRight, Building2, Lock, Mail, ShieldCheck } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/lib/context/AuthContext'
import { useToast } from '@/lib/context/ToastContext'

export default function SignUpPage() {
  const router = useRouter()
  const { signUp } = useAuth()
  const { error: toastError, success: toastSuccess } = useToast()

  const [businessName, setBusinessName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{ businessName?: string; email?: string; password?: string }>({})

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: { businessName?: string; email?: string; password?: string } = {}

    if (!businessName.trim()) newErrors.businessName = 'Business or Studio name is required'
    if (!email.trim()) newErrors.email = 'Email is required'
    if (!password || password.length < 6) newErrors.password = 'Password must be at least 6 characters'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsLoading(true)
    const res = await signUp(email, password, businessName)
    setIsLoading(false)

    if (res.error) {
      toastError('Registration Failed', res.error)
    } else {
      toastSuccess('Studio Initialized', 'Welcome to FlowTrack.')
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 sm:p-6 bg-[#fbfbfb] dark:bg-[#09090b] relative z-10">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 shadow-md mb-2 font-bold"
          >
            <svg
              className="w-6 h-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </motion.div>
          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
            Register Studio
          </h1>
          <p className="text-xs font-mono text-zinc-400">
            Provision your freelance accounting workspace
          </p>
        </div>

        {/* Auth Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 350, damping: 28 }}
          className="glass-card rounded-2xl p-6 sm:p-8 space-y-5"
        >
          <form onSubmit={handleSignUp} className="space-y-4">
            <Input
              label="STUDIO / FREELANCER NAME"
              placeholder="e.g. Studio Vertex"
              value={businessName}
              onChange={(e) => {
                setBusinessName(e.target.value)
                if (errors.businessName) setErrors({ ...errors, businessName: undefined })
              }}
              error={errors.businessName}
              leftIcon={<Building2 className="w-4 h-4 text-zinc-400" />}
              autoFocus
            />

            <Input
              label="EMAIL ADDRESS"
              type="email"
              placeholder="you@studio.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (errors.email) setErrors({ ...errors, email: undefined })
              }}
              error={errors.email}
              leftIcon={<Mail className="w-4 h-4 text-zinc-400" />}
            />

            <Input
              label="PASSWORD (MIN 6 CHARACTERS)"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (errors.password) setErrors({ ...errors, password: undefined })
              }}
              error={errors.password}
              leftIcon={<Lock className="w-4 h-4 text-zinc-400" />}
            />

            <Button
              type="submit"
              className="w-full h-11"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Create Account
            </Button>
          </form>

          <p className="text-center text-xs text-zinc-500 dark:text-zinc-400 pt-2 font-mono">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-bold text-zinc-950 dark:text-white hover:underline ml-1"
            >
              Sign In
            </Link>
          </p>
        </motion.div>

        <div className="flex items-center justify-center gap-1.5 text-zinc-400 text-xs font-mono">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>PostgreSQL with Row Level Security</span>
        </div>
      </div>
    </div>
  )
}
