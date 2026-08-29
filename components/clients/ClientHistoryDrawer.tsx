'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import {
  X,
  Mail,
  Phone,
  MapPin,
  Building2,
  FileText,
  Plus,
  Edit2,
} from 'lucide-react'
import { InvoiceStatusBadge } from '@/components/invoices/InvoiceStatusBadge'
import { Button } from '@/components/ui/Button'
import { formatCurrency, formatDate } from '@/lib/utils/formatters'
import { dbService } from '@/lib/supabase/db-service'
import { useAuth } from '@/lib/context/AuthContext'
import type { Client, InvoiceWithDetails } from '@/lib/supabase/database.types'

interface ClientHistoryDrawerProps {
  client: Client | null
  isOpen: boolean
  onClose: () => void
  onEditClient: (client: Client) => void
  onCreateInvoiceForClient: (client: Client) => void
  onViewInvoice: (invoice: InvoiceWithDetails) => void
}

export function ClientHistoryDrawer({
  client,
  isOpen,
  onClose,
  onEditClient,
  onCreateInvoiceForClient,
  onViewInvoice,
}: ClientHistoryDrawerProps) {
  const { profile } = useAuth()
  const shouldReduceMotion = useReducedMotion()
  const currency = profile?.currency || 'USD'

  const [invoices, setInvoices] = useState<InvoiceWithDetails[]>([])
  const [stats, setStats] = useState({
    totalBilled: 0,
    totalPaid: 0,
    totalOutstanding: 0,
    invoiceCount: 0,
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    async function loadClientData() {
      if (!client) return
      setIsLoading(true)
      try {
        const clientStats = await dbService.getClientInvoiceStats(client.id)
        setInvoices(clientStats.invoices)
        setStats({
          totalBilled: clientStats.totalBilled,
          totalPaid: clientStats.totalPaid,
          totalOutstanding: clientStats.totalOutstanding,
          invoiceCount: clientStats.invoiceCount,
        })
      } catch (e) {
        console.error('Error loading client history:', e)
      } finally {
        setIsLoading(false)
      }
    }

    if (isOpen && client) {
      loadClientData()
    }
  }, [isOpen, client])

  return (
    <AnimatePresence>
      {isOpen && client && (
        <div
          className="fixed inset-0 z-50 overflow-hidden"
          role="dialog"
          aria-modal="true"
          aria-labelledby="drawer-title"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md"
            onClick={onClose}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              initial={shouldReduceMotion ? { opacity: 0 } : { x: '100%' }}
              animate={shouldReduceMotion ? { opacity: 1 } : { x: 0 }}
              exit={shouldReduceMotion ? { opacity: 0 } : { x: '100%' }}
              transition={{ type: 'spring', stiffness: 350, damping: 32 }}
              className="w-screen max-w-xl bg-white/95 dark:bg-[#101014]/95 border-l border-zinc-200 dark:border-white/10 shadow-2xl backdrop-blur-2xl flex flex-col"
            >
              {/* Header */}
              <div className="p-6 border-b border-zinc-100 dark:border-white/[0.06] flex items-start justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 border border-black/5 dark:border-white/10 flex items-center justify-center font-bold text-sm font-mono shadow-sm">
                    {client.company ? client.company.slice(0, 2).toUpperCase() : client.name.slice(0, 2).toUpperCase()}
                  </div>

                  <div>
                    <h2 id="drawer-title" className="text-base font-bold text-zinc-950 dark:text-white tracking-tight">
                      {client.name}
                    </h2>
                    {client.company && (
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5 mt-0.5">
                        <Building2 className="w-3 h-3 text-zinc-400" />
                        <span>{client.company}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onEditClient(client)}
                    className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                    title="Edit Client"
                    aria-label="Edit Client"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={onClose}
                    className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                    aria-label="Close drawer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Drawer Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Contact Details Card */}
                <div className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-zinc-200/80 dark:border-white/[0.06] space-y-2.5 text-xs text-zinc-600 dark:text-zinc-400">
                  <div className="flex items-center gap-2.5">
                    <Mail className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                    <a href={`mailto:${client.email}`} className="hover:text-zinc-950 dark:hover:text-white">
                      {client.email}
                    </a>
                  </div>

                  {client.phone && (
                    <div className="flex items-center gap-2.5">
                      <Phone className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                      <span>{client.phone}</span>
                    </div>
                  )}

                  {client.address && (
                    <div className="flex items-start gap-2.5">
                      <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
                      <span>{client.address}</span>
                    </div>
                  )}
                </div>

                {/* Financial Stats Cards */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03]">
                    <p className="text-[10px] uppercase font-mono font-semibold text-zinc-400">Total Billed</p>
                    <p className="text-sm font-mono font-bold text-zinc-950 dark:text-white mt-1 tabular-nums">
                      {formatCurrency(stats.totalBilled, currency)}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03]">
                    <p className="text-[10px] uppercase font-mono font-semibold text-zinc-400">Total Paid</p>
                    <p className="text-sm font-mono font-bold text-zinc-950 dark:text-white mt-1 tabular-nums">
                      {formatCurrency(stats.totalPaid, currency)}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03]">
                    <p className="text-[10px] uppercase font-mono font-semibold text-zinc-400">Outstanding</p>
                    <p className="text-sm font-mono font-bold text-zinc-950 dark:text-white mt-1 tabular-nums">
                      {formatCurrency(stats.totalOutstanding, currency)}
                    </p>
                  </div>
                </div>

                {/* Invoices List Section */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-950 dark:text-white">
                      Settlement Ledger ({stats.invoiceCount})
                    </h3>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onCreateInvoiceForClient(client)}
                      leftIcon={<Plus className="w-3.5 h-3.5" />}
                    >
                      Create Invoice
                    </Button>
                  </div>

                  {isLoading ? (
                    <div className="py-8 text-center text-xs text-zinc-400 font-mono">Loading history...</div>
                  ) : invoices.length === 0 ? (
                    <div className="p-8 text-center border border-dashed border-zinc-200 dark:border-white/10 rounded-2xl">
                      <FileText className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
                      <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                        No invoices created
                      </p>
                      <p className="text-[11px] text-zinc-400 mt-1">
                        Issue the first invoice for this client.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {invoices.map((inv) => (
                        <div
                          key={inv.id}
                          onClick={() => onViewInvoice(inv)}
                          className="p-3.5 rounded-xl border border-zinc-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.02] hover:border-zinc-400 dark:hover:border-white/30 cursor-pointer transition-all flex items-center justify-between"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono font-bold text-zinc-950 dark:text-white">
                                {inv.invoice_number}
                              </span>
                              <InvoiceStatusBadge status={inv.status} />
                            </div>
                            <p className="text-[11px] font-mono text-zinc-400">
                              Due {formatDate(inv.due_date)}
                            </p>
                          </div>

                          <div className="text-right">
                            <p className="text-xs font-mono font-bold text-zinc-950 dark:text-white tabular-nums">
                              {formatCurrency(inv.total_amount || 0, currency)}
                            </p>
                            <p className="text-[10px] text-zinc-400 mt-0.5">
                              {inv.items?.length || 0} items
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  )
}
