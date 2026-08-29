'use client'

import React from 'react'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, CheckCheck, Eye } from 'lucide-react'
import { InvoiceStatusBadge } from '@/components/invoices/InvoiceStatusBadge'
import { formatCurrency, formatDate } from '@/lib/utils/formatters'
import { useAuth } from '@/lib/context/AuthContext'
import { LiquidCard } from '@/components/ui/LiquidCard'
import type { InvoiceWithDetails } from '@/lib/supabase/database.types'

interface RecentActivityProps {
  invoices: InvoiceWithDetails[]
  onMarkAsPaid?: (id: string) => void
  onViewInvoice?: (invoice: InvoiceWithDetails) => void
}

export function RecentActivity({
  invoices,
  onMarkAsPaid,
  onViewInvoice,
}: RecentActivityProps) {
  const { profile } = useAuth()
  const shouldReduceMotion = useReducedMotion()
  const currency = profile?.currency || 'USD'

  return (
    <motion.div
      initial={shouldReduceMotion ? {} : { opacity: 0, y: 16 }}
      animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
      transition={{ delay: 0.3, type: 'spring', stiffness: 300, damping: 25 }}
      className="w-full"
    >
      <LiquidCard className="p-6" tiltStrength={3} glareOpacity={0.06}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider font-mono text-zinc-950 dark:text-white">
              Recent Ledger Activity
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Latest invoice issuances, modifications, and settlements
            </p>
          </div>

          <Link
            href="/invoices"
            className="inline-flex items-center gap-1 text-xs font-mono font-medium text-zinc-700 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white transition-colors"
          >
            <span>All Ledgers</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {invoices.length === 0 ? (
          <div className="text-center py-8 text-zinc-400 text-xs font-mono">
            No recent activity found.
          </div>
        ) : (
          <div className="divide-y divide-zinc-200/60 dark:divide-white/[0.06]">
            {invoices.map((inv) => (
              <motion.div
                key={inv.id}
                whileHover={shouldReduceMotion ? {} : { x: 4 }}
                transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group hover:bg-black/[0.02] dark:hover:bg-white/[0.03] -mx-3 px-3 rounded-xl transition-colors cursor-pointer"
                onClick={() => onViewInvoice && onViewInvoice(inv)}
              >
                {/* Left: Client & Number */}
                <div className="flex items-start sm:items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-black/[0.05] dark:bg-white/[0.08] border border-black/5 dark:border-white/10 flex items-center justify-center text-zinc-800 dark:text-zinc-200 font-mono font-bold text-xs shrink-0 shadow-xs">
                    {inv.client?.company ? inv.client.company.slice(0, 2).toUpperCase() : 'FT'}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-zinc-950 dark:text-white">
                        {inv.client?.company || inv.client?.name || 'Unknown Client'}
                      </p>
                      <InvoiceStatusBadge status={inv.status} />
                    </div>
                    <p className="text-[11px] font-mono text-zinc-400 mt-0.5">
                      {inv.invoice_number} • Issued {formatDate(inv.issue_date)}
                    </p>
                  </div>
                </div>

                {/* Right: Amount & Quick Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-3 pl-12 sm:pl-0" onClick={(e) => e.stopPropagation()}>
                  <p className="text-xs font-mono font-bold text-zinc-950 dark:text-white tabular-nums">
                    {formatCurrency(inv.total_amount || 0, currency)}
                  </p>

                  <div className="flex items-center gap-1 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    {inv.status !== 'paid' && onMarkAsPaid && (
                      <motion.button
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.88 }}
                        onClick={() => onMarkAsPaid(inv.id)}
                        className="p-1.5 rounded-lg text-zinc-700 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
                        title="Quick mark as Paid"
                        aria-label="Quick mark as Paid"
                      >
                        <CheckCheck className="w-4 h-4" />
                      </motion.button>
                    )}

                    {onViewInvoice && (
                      <motion.button
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.88 }}
                        onClick={() => onViewInvoice(inv)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
                        title="Preview invoice"
                        aria-label="Preview invoice"
                      >
                        <Eye className="w-4 h-4" />
                      </motion.button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </LiquidCard>
    </motion.div>
  )
}
