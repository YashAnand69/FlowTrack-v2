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
  Download,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { formatCurrency } from '@/lib/utils/formatters'
import { useAuth } from '@/lib/context/AuthContext'
import { useToast } from '@/lib/context/ToastContext'
import { soundEngine } from '@/lib/utils/haptics'
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
  const { success } = useToast()
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

  const handleExportCSV = () => {
    soundEngine.playSuccess()
    const headers = ['Name', 'Company', 'Email', 'Phone', 'Address', 'Total Billed', 'Invoices Count']
    const rows = filteredClients.map((c) => {
      const meta = clientBilledMap[c.id] || { totalBilled: 0, invoiceCount: 0 }
      return [
        `"${c.name}"`,
        `"${c.company || ''}"`,
        `"${c.email || ''}"`,
        `"${c.phone || ''}"`,
        `"${c.address || ''}"`,
        meta.totalBilled,
        meta.invoiceCount,
      ].join(',')
    })

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `clients_directory_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    success('CSV Exported', 'Client directory exported to spreadsheet CSV.')
  }

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

        <div className="flex items-center gap-2">
          {filteredClients.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              leftIcon={<Download className="w-3.5 h-3.5" />}
            >
              Export CSV
            </Button>
          )}

          <Button
            onClick={() => {
              soundEngine.playClick()
              onAddClient()
            }}
            leftIcon={<UserPlus className="w-3.5 h-3.5" />}
            size="sm"
          >
            Add Client
          </Button>
        </div>
      </div>

      {/* Table Container */}
      {filteredClients.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <Building2 className="w-9 h-9 text-zinc-400 mx-auto mb-3" />
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-950 dark:text-white">
            No Clients Found
          </h3>
          <p className="text-xs text-zinc-400 mt-1 mb-4">
            {search ? 'No clients match your filter term.' : 'Get started by creating your first client profile.'}
          </p>
          <Button onClick={onAddClient} size="sm">
            Add First Client
          </Button>
        </div>
      ) : (
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 8 }}
          animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
          className="glass-card rounded-2xl overflow-hidden shadow-xs"
        >
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-200/80 dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.02] text-zinc-400 font-mono uppercase text-[10px] tracking-wider">
                  <th className="py-3.5 pl-6 pr-4">Client / Organization</th>
                  <th className="py-3.5 px-4">Contact Channels</th>
                  <th className="py-3.5 px-4 text-center">Total Invoices</th>
                  <th className="py-3.5 px-4 text-right">Lifetime Billed</th>
                  <th className="py-3.5 pl-4 pr-6 text-right">Actions</th>
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
                      onClick={() => {
                        soundEngine.playClick()
                        onSelectClient(client)
                      }}
                      className="hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition-colors cursor-pointer group"
                    >
                      {/* Client Name & Company */}
                      <td className="py-4 pl-6 pr-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-black/[0.04] dark:bg-white/[0.06] border border-black/5 dark:border-white/10 text-zinc-950 dark:text-white flex items-center justify-center font-mono font-bold text-xs shrink-0 group-hover:scale-105 transition-transform">
                            {initials}
                          </div>
                          <div>
                            <p className="font-bold text-zinc-950 dark:text-white group-hover:underline">
                              {client.name}
                            </p>
                            {client.company && (
                              <p className="text-[11px] text-zinc-400 font-medium">
                                {client.company}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Contact Info */}
                      <td className="py-4 px-4 font-mono text-[11px]">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400">
                            <Mail className="w-3 h-3 text-zinc-400" />
                            <span>{client.email}</span>
                          </div>
                          {client.phone && (
                            <div className="flex items-center gap-1.5 text-zinc-400">
                              <Phone className="w-3 h-3 text-zinc-400" />
                              <span>{client.phone}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Invoices Count */}
                      <td className="py-4 px-4 text-center font-mono text-[11px] text-zinc-500 dark:text-zinc-400">
                        <span className="px-2 py-0.5 rounded-md bg-black/[0.03] dark:bg-white/[0.05] border border-black/5 dark:border-white/10">
                          {meta.invoiceCount} invoices
                        </span>
                      </td>

                      {/* Lifetime Billed */}
                      <td className="py-4 px-4 text-right font-mono font-bold text-zinc-950 dark:text-white tabular-nums text-xs">
                        {formatCurrency(meta.totalBilled, currency)}
                      </td>

                      {/* Actions */}
                      <td className="py-4 pl-4 pr-6 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => {
                              soundEngine.playClick()
                              onSelectClient(client)
                            }}
                            className="p-1.5 text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                            title="View Invoices & History"
                          >
                            <History className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              soundEngine.playClick()
                              onEditClient(client)
                            }}
                            className="p-1.5 text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                            title="Edit Client"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Delete client "${client.name}" and all associated invoices?`)) {
                                soundEngine.playClick()
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
                  onClick={() => {
                    soundEngine.playClick()
                    onSelectClient(client)
                  }}
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
                        onClick={() => {
                          soundEngine.playClick()
                          onEditClient(client)
                        }}
                        className="p-1 text-zinc-400 hover:text-zinc-900"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete client "${client.name}"?`)) {
                            soundEngine.playClick()
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
