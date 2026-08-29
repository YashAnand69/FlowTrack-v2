'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { FilePlus, Sparkles, UserPlus, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface EmptyStateProps {
  onCreateInvoice: () => void
  onAddClient?: () => void
}

export function EmptyState({ onCreateInvoice, onAddClient }: EmptyStateProps) {
  return (
    <div className="glass-card rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden">
      <div className="max-w-md mx-auto flex flex-col items-center">
        {/* Modern Monochrome Icon Container */}
        <div className="w-16 h-16 rounded-2xl bg-black/[0.04] dark:bg-white/[0.06] border border-black/5 dark:border-white/10 flex items-center justify-center text-zinc-950 dark:text-white mb-6 shadow-sm">
          <FilePlus className="w-8 h-8" />
        </div>

        <h3 className="text-xl font-bold text-zinc-950 dark:text-white tracking-tight">
          Welcome to FlowTrack
        </h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 leading-relaxed max-w-sm">
          No clients or invoices created yet. Start by generating your first ledger item or onboarding a client.
        </p>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full my-6 text-left">
          <div className="p-3.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-zinc-200/60 dark:border-white/[0.06] flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-zinc-900 dark:text-white mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-bold text-zinc-900 dark:text-white font-mono">
                Dynamic Math
              </p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Precision rates & multi-currency
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-zinc-200/60 dark:border-white/[0.06] flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-zinc-900 dark:text-white mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-bold text-zinc-900 dark:text-white font-mono">
                Encrypted RLS
              </p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Hardened PostgreSQL policies
              </p>
            </div>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <Button
            onClick={onCreateInvoice}
            size="md"
            className="w-full sm:w-auto"
            leftIcon={<FilePlus className="w-4 h-4" />}
          >
            Create First Invoice
          </Button>

          {onAddClient && (
            <Button
              variant="outline"
              size="md"
              onClick={onAddClient}
              className="w-full sm:w-auto"
              leftIcon={<UserPlus className="w-4 h-4" />}
            >
              Add Client
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
