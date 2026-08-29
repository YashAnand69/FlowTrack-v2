'use client'

import React, { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import {
  Search,
  Edit2,
  Trash2,
  UserPlus,
  Mail,
  Phone,
  Building2,
  History,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { formatCurrency } from '@/lib/utils/formatters'
import { useAuth } from '@/lib/context/AuthContext'
import type { Client } from '@/lib/supabase/database.types'

interface ClientsTableProps {
  clients: Client[]
  clientBilledMap?: Record<string, { totalBilled: number; invoiceCount: number }>
  onSelectClient: (client: Client) => void
  onEditClient: (client: Client) => void
  onDeleteClient: (id: string) => void
  onAddClient: () => void
}

export function ClientsTable({
  clients,
  clientBilledMap = {},
  onSelectClient,
  onEditClient,
  onDeleteClient,
  onAddClient,
}: ClientsTableProps) {
  const { profile } = useAuth()
  const currency = profile?.currency || 'USD'
  const [search, setSearch] = useState('')
  const shouldReduceMotion = useReducedMotion()

  const filteredClients = clients.filter((c) => {
    const q = search.toLowerCase()
    return (
      c.name.toLowerCase().includes(q) ||
      (c.company && c.company.toLowerCase().includes(q)) ||
      c.email.toLowerCase().includes(q) ||
      (c.phone && c.phone.includes(q))
    )
  })

  return (
    <div className="space-y-4">
      {/* Search & Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter clients by name or organization..."
            className="w-full h-9 pl-9 pr-4 text-xs rounded-xl border border-zinc-200/80 dark:border-white/[0.08] bg-white/60 dark:bg-white/[0.03] text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-white/30 transition-all font-medium"
          />
        </div>

        <Button
          onClick={onAddClient}
          leftIcon={<UserPlus className="w-3.5 h-3.5" />}
          size="sm"
        >
          Add Client
        </Button>
      </div>

      {/* Table Container */}
      {filteredClients.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <Building2 className="w-9 h-9 text-zinc-400 mx-auto mb-3" />
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-950 dark:text-white">
            No clients matching query
          </h3>
          <p className="text-xs text-zinc-400 mt-1 max-w-xs mx-auto">
            {search ? 'Try adjusting your search criteria.' : 'Create your first client record.'}
          </p>
          {!search && (
            <Button
              onClick={onAddClient}
              size="sm"
              className="mt-4"
              leftIcon={<UserPlus className="w-3.5 h-3.5" />}
            >
              Add Client
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
                  <th className="py-3.5 px-6">Client / Representative</th>
                  <th className="py-3.5 px-6">Organization</th>
                  <th className="py-3.5 px-6">Communications</th>
                  <th className="py-3.5 px-6 text-right">Lifetime Billed</th>
                  <th className="py-3.5 px-6 text-center">Ledgers</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/60 dark:divide-white/[0.06]">
                {filteredClients.map((client) => {
                  const meta = clientBilledMap[client.id] || { totalBilled: 0, invoiceCount: 0 }
                  const initials = client.company
                    ? client.company.slice(0, 2).toUpperCase()
                    : client.name.slice(0, 2).toUpperCase()

                  return (
                    <tr
                      key={client.id}
                      className="hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition-colors group cursor-pointer"
                      onClick={() => onSelectClient(client)}
                    >
                      {/* Name & Avatar */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-black/[0.05] dark:bg-white/[0.08] text-zinc-950 dark:text-white border border-black/5 dark:border-white/10 flex items-center justify-center font-mono font-bold text-xs shrink-0">
                            {initials}
                          </div>
                          <div>
                            <p className="font-bold text-zinc-950 dark:text-white transition-colors">
                              {client.name}
                            </p>
                            <p className="text-[11px] font-mono text-zinc-400">Added {new Date(client.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </td>

                      {/* Company */}
                      <td className="py-4 px-6 font-medium text-zinc-700 dark:text-zinc-300">
                        {client.company || '—'}
                      </td>

                      {/* Contact Info */}
                      <td className="py-4 px-6 text-zinc-500 dark:text-zinc-400 space-y-0.5 font-mono text-[11px]">
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3 h-3 text-zinc-400" />
                          <span>{client.email}</span>
                        </div>
                        {client.phone && (
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3 h-3 text-zinc-400" />
                            <span>{client.phone}</span>
                          </div>
                        )}
                      </td>

                      {/* Total Billed */}
                      <td className="py-4 px-6 text-right font-mono font-bold text-zinc-950 dark:text-white tabular-nums">
                        {formatCurrency(meta.totalBilled, currency)}
                      </td>

                      {/* Invoices Count */}
                      <td className="py-4 px-6 text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-black/[0.04] dark:bg-white/[0.06] border border-black/5 dark:border-white/10 text-zinc-700 dark:text-zinc-300">
                          {meta.invoiceCount} {meta.invoiceCount === 1 ? 'inv' : 'invs'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onSelectClient(client)}
                            className="p-1.5 text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                            title="View Invoices & History"
                          >
                            <History className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onEditClient(client)}
                            className="p-1.5 text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                            title="Edit Client"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Delete client "${client.name}" and all associated invoices?`)) {
                                onDeleteClient(client.id)
                              }
                            }}
                            className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                            title="Delete Client"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Stacked Cards */}
          <div className="md:hidden divide-y divide-zinc-200/60 dark:divide-white/[0.06]">
            {filteredClients.map((client) => {
              const meta = clientBilledMap[client.id] || { totalBilled: 0, invoiceCount: 0 }
              const initials = client.company
                ? client.company.slice(0, 2).toUpperCase()
                : client.name.slice(0, 2).toUpperCase()

              return (
                <div
                  key={client.id}
                  onClick={() => onSelectClient(client)}
                  className="p-4 space-y-3 hover:bg-black/[0.02] dark:hover:bg-white/[0.03] cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-black/[0.05] dark:bg-white/[0.08] text-zinc-950 dark:text-white font-mono font-bold text-xs flex items-center justify-center">
                        {initials}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-zinc-950 dark:text-white">
                          {client.name}
                        </p>
                        {client.company && (
                          <p className="text-[11px] text-zinc-500">{client.company}</p>
                        )}
                      </div>
                    </div>

                    <p className="text-xs font-mono font-bold text-zinc-950 dark:text-white tabular-nums">
                      {formatCurrency(meta.totalBilled, currency)}
                    </p>
                  </div>

                  <div className="text-[11px] font-mono text-zinc-500 space-y-0.5">
                    <p>{client.email}</p>
                    {client.phone && <p>{client.phone}</p>}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-white/[0.06] text-xs" onClick={(e) => e.stopPropagation()}>
                    <span className="text-[11px] font-mono text-zinc-400">{meta.invoiceCount} invoices</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onEditClient(client)}
                        className="p-1 text-zinc-400 hover:text-zinc-900"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete client "${client.name}"?`)) {
                            onDeleteClient(client.id)
                          }
                        }}
                        className="p-1 text-rose-500 hover:text-rose-700"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>
      )}
    </div>
  )
}
