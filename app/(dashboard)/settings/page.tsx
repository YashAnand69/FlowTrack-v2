'use client'

import React, { useState, useEffect } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import {
  Building2,
  Moon,
  Sun,
  Upload,
  RotateCcw,
  Check,
  Percent,
  Database,
  Flame,
} from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { CURRENCY_SYMBOLS } from '@/lib/utils/formatters'
import { useAuth } from '@/lib/context/AuthContext'
import { useTheme } from '@/lib/context/ThemeContext'
import { useToast } from '@/lib/context/ToastContext'
import { dbService } from '@/lib/supabase/db-service'
import { isFirebaseConfigured } from '@/lib/firebase/config'
import { isSupabaseConfigured } from '@/lib/supabase/client'

export default function SettingsPage() {
  const { user, profile, refreshProfile } = useAuth()
  const { theme, setTheme } = useTheme()
  const { success, error: toastError } = useToast()
  const shouldReduceMotion = useReducedMotion()

  const [businessName, setBusinessName] = useState('')
  const [businessEmail, setBusinessEmail] = useState('')
  const [currency, setCurrency] = useState('USD')
  const [taxRate, setTaxRate] = useState('0')
  const [paymentTerms, setPaymentTerms] = useState('')
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (profile) {
      setBusinessName(profile.business_name || '')
      setBusinessEmail(profile.business_email || user?.email || '')
      setCurrency(profile.currency || 'USD')
      setTaxRate(String(profile.tax_rate ?? 0))
      setPaymentTerms(profile.payment_terms || '')
      setLogoPreview(profile.logo_url)
    }
  }, [profile, user])

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toastError('Invalid File', 'Please upload a PNG, JPG, or SVG image.')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setLogoPreview(reader.result as string)
      success('Logo loaded', 'Click Save Changes to persist your new logo.')
    }
    reader.readAsDataURL(file)
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      await dbService.updateProfile(
        {
          business_name: businessName,
          business_email: businessEmail,
          currency,
          tax_rate: Number(taxRate) || 0,
          payment_terms: paymentTerms,
          logo_url: logoPreview,
        },
        user?.id
      )
      await refreshProfile()
      window.dispatchEvent(new CustomEvent('flowtrack_data_updated'))
      success('Preferences Persisted', 'Your studio identity and settings were updated.')
    } catch (err: any) {
      toastError('Failed to save settings', err.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleResetDemo = () => {
    if (confirm('Reset ledger demo data back to default state?')) {
      dbService.resetDemoData()
      refreshProfile()
      window.dispatchEvent(new CustomEvent('flowtrack_data_updated'))
      success('Demo data reset', 'Clean default records restored.')
    }
  }

  const currencyOptions = Object.entries(CURRENCY_SYMBOLS).map(([code, meta]) => ({
    value: code,
    label: `${meta.label} - ${meta.symbol}`,
  }))

  const activeDatabaseLabel = isFirebaseConfigured
    ? 'Firebase Auth & Cloud Firestore'
    : isSupabaseConfigured
    ? 'Supabase PostgreSQL & RLS'
    : 'Local Storage Offline Engine'

  const activeDatabaseDesc = isFirebaseConfigured
    ? 'Connected to Firebase Authentication and Cloud Firestore.'
    : isSupabaseConfigured
    ? 'Connected to Supabase PostgreSQL with active Row Level Security.'
    : 'Add Firebase credentials in .env.local to activate Cloud Firestore.'

  return (
    <motion.div
      initial={shouldReduceMotion ? {} : { opacity: 0, y: 10 }}
      animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
      className="max-w-3xl space-y-8"
    >
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
          Studio Preferences
        </h1>
        <p className="text-xs text-zinc-400 mt-1 font-mono">
          Configure branding identity, multi-currency ledger rules, and appearance
        </p>
      </div>

      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* Section 1: Business Profile & Branding */}
        <div className="glass-card rounded-2xl p-6 space-y-5">
          <div className="border-b border-zinc-100 dark:border-white/[0.06] pb-4">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-950 dark:text-white">
              Studio Identity & Emblems
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              These credentials appear on your exported client ledger PDFs and statements.
            </p>
          </div>

          {/* Logo Upload */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-2 font-bold">
              Emblem / Logo
            </label>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-black/[0.04] dark:bg-white/[0.06] border border-black/5 dark:border-white/10 flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                {logoPreview ? (
                  <img src={logoPreview} alt="Business logo" className="w-full h-full object-cover" />
                ) : (
                  <Building2 className="w-6 h-6 text-zinc-900 dark:text-white" />
                )}
              </div>

              <div className="space-y-1">
                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-zinc-900 dark:text-zinc-100 bg-black/[0.04] hover:bg-black/[0.08] dark:bg-white/[0.06] dark:hover:bg-white/[0.1] border border-black/5 dark:border-white/10 rounded-xl cursor-pointer transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Select Vector / Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </label>
                <p className="text-[11px] font-mono text-zinc-400">
                  PNG, SVG or WEBP (square 1:1 ratio recommended)
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="STUDIO / BUSINESS NAME"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="e.g. Rivera Design Studio"
            />

            <Input
              label="BILLING EMAIL ADDRESS"
              type="email"
              value={businessEmail}
              onChange={(e) => setBusinessEmail(e.target.value)}
              placeholder="e.g. billing@riveradesign.co"
            />
          </div>
        </div>

        {/* Section 2: Currency & Invoicing Defaults */}
        <div className="glass-card rounded-2xl p-6 space-y-5">
          <div className="border-b border-zinc-100 dark:border-white/[0.06] pb-4">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-950 dark:text-white">
              Ledger Currency & Fiscal Rules
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Set standard settlement currency and automated tax provisions.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="CURRENCY SYMBOL & FORMAT"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              options={currencyOptions}
              helperText="Updates all ledger totals and monetary charts in real-time."
            />

            <Input
              label="DEFAULT TAX / VAT RATE (%)"
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={taxRate}
              onChange={(e) => setTaxRate(e.target.value)}
              placeholder="0"
              leftIcon={<Percent className="w-3.5 h-3.5 text-zinc-400" />}
              helperText="Applied dynamically on invoice generation."
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
              STANDARD SETTLEMENT TERMS
            </label>
            <textarea
              rows={2}
              value={paymentTerms}
              onChange={(e) => setPaymentTerms(e.target.value)}
              placeholder="e.g. Payment due within 14 days of invoice date."
              className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200/80 dark:border-white/[0.08] bg-white/60 dark:bg-white/[0.03] text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-white/30 font-medium"
            />
          </div>
        </div>

        {/* Section 3: Appearance & Theme */}
        <div className="glass-card rounded-2xl p-6 space-y-4">
          <div className="border-b border-zinc-100 dark:border-white/[0.06] pb-4">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-950 dark:text-white">
              Visual Environment
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Select your monochrome interface mode (persisted to browser storage).
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => setTheme('light')}
              className={`p-4 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                theme === 'light'
                  ? 'border-zinc-950 dark:border-white bg-black/[0.04] dark:bg-white/[0.08] ring-1 ring-zinc-950 dark:ring-white shadow-xs'
                  : 'border-zinc-200 dark:border-white/[0.08] hover:border-zinc-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <Sun className="w-5 h-5 text-zinc-950 dark:text-white" />
                {theme === 'light' && <Check className="w-4 h-4 text-zinc-950 dark:text-white" />}
              </div>
              <div className="mt-3">
                <p className="text-xs font-bold font-mono text-zinc-950 dark:text-white">LIGHT CANVAS</p>
                <p className="text-[11px] text-zinc-400">Pure white frosted glass</p>
              </div>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => setTheme('dark')}
              className={`p-4 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                theme === 'dark'
                  ? 'border-zinc-950 dark:border-white bg-black/[0.04] dark:bg-white/[0.08] ring-1 ring-zinc-950 dark:ring-white shadow-xs'
                  : 'border-zinc-200 dark:border-white/[0.08] hover:border-zinc-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <Moon className="w-5 h-5 text-zinc-950 dark:text-white" />
                {theme === 'dark' && <Check className="w-4 h-4 text-zinc-950 dark:text-white" />}
              </div>
              <div className="mt-3">
                <p className="text-xs font-bold font-mono text-zinc-950 dark:text-white">DARK CANVAS</p>
                <p className="text-[11px] text-zinc-400">Deep charcoal #09090b</p>
              </div>
            </motion.button>
          </div>
        </div>

        {/* Section 4: Data Layer Status */}
        <div className="glass-card rounded-2xl p-6 space-y-4">
          <div className="border-b border-zinc-100 dark:border-white/[0.06] pb-4">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-950 dark:text-white">
              Storage Engine Infrastructure
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Current database connection status and sample state tools.
            </p>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-zinc-200/60 dark:border-white/[0.06]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-black/[0.05] dark:bg-white/[0.08] text-zinc-950 dark:text-white flex items-center justify-center">
                {isFirebaseConfigured ? (
                  <Flame className="w-4 h-4 text-amber-500" />
                ) : (
                  <Database className="w-4 h-4" />
                )}
              </div>
              <div>
                <p className="text-xs font-bold font-mono text-zinc-950 dark:text-white">
                  {activeDatabaseLabel}
                </p>
                <p className="text-[11px] text-zinc-400">
                  {activeDatabaseDesc}
                </p>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleResetDemo}
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            >
              Reset Demo Data
            </Button>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3 pt-2">
          <Button type="submit" size="md" isLoading={isSaving}>
            Persist Changes
          </Button>
        </div>
      </form>
    </motion.div>
  )
}
