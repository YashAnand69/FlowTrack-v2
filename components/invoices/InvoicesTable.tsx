'use client'

import React, { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import {
  Search,
  CheckCircle2,
  Eye,
  Edit2,
  Trash2,
  FilePlus,
  Calendar,
} from 'lucide-react'
import { InvoiceStatusBadge } from './InvoiceStatusBadge'
import { Button } from '@/components/ui/Button'
import { formatCurrency, formatDate } from '@/lib/utils/formatters'
import { useAuth } from '@/lib/context/AuthContext'
import type { InvoiceWithDetails, InvoiceStatus } from '@/lib/supabase/database.types'

interface InvoicesTableProps {
  invoices: InvoiceWithDetails[]
  onSelectInvoice: (invoice: InvoiceWithDetails) => void
  onEditInvoice: (invoice: InvoiceWithDetails) => void
  onDeleteInvoice: (id: string) => void
  onMarkAsPaid: (id: string) => void
  onNewInvoice: () => void
}

export function InvoicesTable({
  invoices,
  onSelectInvoice,
  onEditInvoice,
  onDeleteInvoice,
  onMarkAsPaid,
  onNewInvoice,
}: InvoicesTableProps) {
  const { profile } = useAuth()
  const currency = profile?.currency || 'USD'
  const shouldReduceMotion = useReducedMotion()

  const [statusFilter, setStatusFilter] = useState<'all' | InvoiceStatus>('all')
  const [search, setSearch] = useState('')
  const [dateRange, setDateRange] = useState<'all' | '30days' | '60days' | 'this_year'>('all')

  const filterTabs: Array<{ id: 'all' | InvoiceStatus; label: string }> = [
    { id: 'all', label: 'All Invoices' },
    { id: 'draft', label: 'Draft' },
    { id: 'sent', label: 'Sent' },
    { id: 'paid', label: 'Paid' },
    { id: 'overdue', label: 'Overdue' },
  ]

  const filteredInvoices = invoices.filter((inv) => {
    if (statusFilter !== 'all' && inv.status !== statusFilter) {
      return false
    }

    const q = search.toLowerCase()
    const matchNum = inv.invoice_number.toLowerCase().includes(q)
    const matchClient =
      (inv.client?.name && inv.client.name.toLowerCase().includes(q)) ||
      (inv.client?.company && inv.client.company.toLowerCase().includes(q))
    const matchItem = inv.items?.some((it) => it.description.toLowerCase().includes(q))
    if (search && !matchNum && !matchClient && !matchItem) {
      return false
    }

    if (dateRange !== 'all') {
      const invDate = new Date(inv.issue_date).getTime()
      const now = Date.now()
      if (dateRange === '30days' && now - invDate > 30 * 86400000) return false
      if (dateRange === '60days' && now - invDate > 60 * 86400000) return false
      if (dateRange === 'this_year') {
        const invYear = new Date(inv.issue_date).getFullYear()
        if (invYear !== new Date().getFullYear()) return false
      }
    }

    return true
  })

  return (
    <div className="space-y-4">
      {/* Filter Tabs & Search Controls */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Status Filter Tabs with Shared Layout Spring Indicator */}
        <div className="flex items-center gap-1 p-1 bg-black/[0.03] dark:bg-white/[0.04] rounded-xl border border-zinc-200/80 dark:border-white/[0.08] overflow-x-auto relative">
          {filterTabs.map((tab) => {
            const count = tab.id === 'all'
              ? invoices.length
              : invoices.filter((i) => i.status === tab.id).length
            const isSelected = statusFilter === tab.id

            return (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 relative z-10 cursor-pointer ${
                  isSelected
                    ? 'text-zinc-950 dark:text-white font-bold'
                    : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
                }`}
              >
                {isSelected && (
                  <motion.div
                    layoutId="activeFilterTab"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    className="absolute inset-0 rounded-lg bg-white dark:bg-[#1a1a20] border border-zinc-200 dark:border-white/10 shadow-xs"
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
                <span
                  className={`relative z-10 text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected
                      ? 'bg-zinc-100 dark:bg-white/10 text-zinc-900 dark:text-white font-bold'
                      : 'bg-zinc-200/60 dark:bg-white/[0.05] text-zinc-500'
                  }`}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Search, Date Filter & New Button */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search ledger items..."
              className="w-full h-9 pl-9 pr-3 text-xs rounded-xl border border-zinc-200/80 dark:border-white/[0.08] bg-white/60 dark:bg-white/[0.03] text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-white/30 transition-all font-medium"
            />
          </div>

          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as any)}
            className="h-9 px-3 text-xs font-mono rounded-xl border border-zinc-200/80 dark:border-white/[0.08] bg-white/60 dark:bg-white/[0.03] text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-400 cursor-pointer hidden sm:block"
          >
            <option value="all">All Dates</option>
            <option value="30days">Last 30 Days</option>
            <option value="60days">Last 60 Days</option>
            <option value="this_year">This Year</option>
          </select>

          <Button
            size="sm"
            onClick={onNewInvoice}
            leftIcon={<FilePlus className="w-3.5 h-3.5" />}
          >
            New Invoice
          </Button>
        </div>
      </div>

      {/* Table Content */}
      {filteredInvoices.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <Calendar className="w-9 h-9 text-zinc-400 mx-auto mb-3" />
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-950 dark:text-white">
            No invoices matching criteria
          </h3>
          <p className="text-xs text-zinc-400 mt-1 max-w-xs mx-auto">
            {search || statusFilter !== 'all'
              ? 'Try adjusting your search query or status filter.'
              : 'Create your first invoice to record transactions.'}
          </p>
          {statusFilter === 'all' && !search && (
            <Button size="sm" onClick={onNewInvoice} className="mt-4">
              New Invoice
            </Button>
          )}
        </div>
      ) : (
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 12 }}
          animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
          className="glass-card rounded-2xl overflow-hidden"
        >
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-200/60 dark:border-white/[0.06] text-zinc-400 font-mono text-[11px] uppercase tracking-wider bg-black/[0.02] dark:bg-white/[0.02]">
                  <th className="py-3.5 px-6">Invoice Identifier</th>
                  <th className="py-3.5 px-6">Counterparty</th>
                  <th className="py-3.5 px-6">Issue Date</th>
                  <th className="py-3.5 px-6">Due Date</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Settlement Total</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/60 dark:divide-white/[0.06]">
                {filteredInvoices.map((inv) => (
                  <tr
                    key={inv.id}
                    onClick={() => onSelectInvoice(inv)}
                    className="hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition-colors group cursor-pointer"
                  >
                    {/* Invoice Number */}
                    <td className="py-4 px-6 font-mono font-bold text-zinc-950 dark:text-white">
                      {inv.invoice_number}
                    </td>

                    {/* Client */}
                    <td className="py-4 px-6">
                      <div className="font-bold text-zinc-900 dark:text-zinc-100">
                        {inv.client?.company || inv.client?.name || '—'}
                      </div>
                      {inv.client?.company && inv.client?.name && (
                        <div className="text-[11px] text-zinc-400 font-mono">{inv.client.name}</div>
                      )}
                    </td>

                    {/* Issue Date */}
                    <td className="py-4 px-6 text-zinc-500 dark:text-zinc-400 font-mono text-[11px]">
                      {formatDate(inv.issue_date)}
                    </td>

                    {/* Due Date */}
                    <td className="py-4 px-6 text-zinc-500 dark:text-zinc-400 font-mono text-[11px]">
                      {formatDate(inv.due_date)}
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 px-6">
                      <InvoiceStatusBadge status={inv.status} />
                    </td>

                    {/* Amount */}
                    <td className="py-4 px-6 text-right font-mono font-bold text-zinc-950 dark:text-white tabular-nums">
                      {formatCurrency(inv.total_amount || 0, currency)}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        {inv.status !== 'paid' && (
                          <button
                            onClick={() => onMarkAsPaid(inv.id)}
                            className="p-1.5 text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                            title="Quick mark as Paid"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => onSelectInvoice(inv)}
                          className="p-1.5 text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                          title="Preview / Print"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onEditInvoice(inv)}
                          className="p-1.5 text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete invoice "${inv.invoice_number}"?`)) {
                              onDeleteInvoice(inv.id)
                            }
                          }}
                          className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Stacked Cards */}
          <div className="md:hidden divide-y divide-zinc-200/60 dark:divide-white/[0.06]">
            {filteredInvoices.map((inv) => (
              <div
                key={inv.id}
                onClick={() => onSelectInvoice(inv)}
                className="p-4 space-y-3 hover:bg-black/[0.02] dark:hover:bg-white/[0.03] cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-mono font-bold text-zinc-950 dark:text-white">
                      {inv.invoice_number}
                    </span>
                    <p className="text-xs font-medium text-zinc-600 dark:text-zinc-300 mt-0.5">
                      {inv.client?.company || inv.client?.name || 'Unknown Client'}
                    </p>
                  </div>

                  <InvoiceStatusBadge status={inv.status} />
                </div>

                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-zinc-400">Due {formatDate(inv.due_date)}</span>
                  <span className="font-bold text-zinc-950 dark:text-white tabular-nums">
                    {formatCurrency(inv.total_amount || 0, currency)}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-white/[0.06] text-xs" onClick={(e) => e.stopPropagation()}>
                  <span className="text-zinc-400 font-mono text-[11px]">{inv.items?.length || 0} items</span>

                  <div className="flex items-center gap-2">
                    {inv.status !== 'paid' && (
                      <button
                        onClick={() => onMarkAsPaid(inv.id)}
                        className="text-zinc-900 dark:text-white font-mono font-medium text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Pay</span>
                      </button>
                    )}
                    <button
                      onClick={() => onEditInvoice(inv)}
                      className="p-1 text-zinc-400 hover:text-zinc-900"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete invoice "${inv.invoice_number}"?`)) {
                          onDeleteInvoice(inv.id)
                        }
                      }}
                      className="p-1 text-rose-500 hover:text-rose-700"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
