'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  LayoutDashboard,
  Receipt,
  Users,
  Settings,
  Plus,
  Moon,
  Sun,
  RotateCcw,
  ArrowRight,
  Download,
  Command,
} from 'lucide-react'
import { useTheme } from '@/lib/context/ThemeContext'
import { useToast } from '@/lib/context/ToastContext'
import { dbService } from '@/lib/supabase/db-service'
import { soundEngine } from '@/lib/utils/haptics'

interface CommandItem {
  id: string
  title: string
  subtitle?: string
  category: 'Navigation' | 'Actions' | 'Theme & Ledger'
  icon: React.ReactNode
  perform: () => void
}

interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
  onOpenInvoiceModal?: () => void
  onOpenClientModal?: () => void
}

export function CommandPalette({
  isOpen,
  onClose,
  onOpenInvoiceModal,
  onOpenClientModal,
}: CommandPaletteProps) {
  const router = useRouter()
  const { theme, toggleTheme } = useTheme()
  const { success } = useToast()
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
      soundEngine.playClick()
    }
  }, [isOpen])

  const commands: CommandItem[] = [
    // Navigation
    {
      id: 'nav-dashboard',
      title: 'Go to Dashboard',
      subtitle: 'View overall revenue and live studio metrics',
      category: 'Navigation',
      icon: <LayoutDashboard className="w-4 h-4" />,
      perform: () => router.push('/dashboard'),
    },
    {
      id: 'nav-invoices',
      title: 'Go to Invoices',
      subtitle: 'Manage, search, and track invoice statuses',
      category: 'Navigation',
      icon: <Receipt className="w-4 h-4" />,
      perform: () => router.push('/invoices'),
    },
    {
      id: 'nav-clients',
      title: 'Go to Clients',
      subtitle: 'Client portfolio and relationship histories',
      category: 'Navigation',
      icon: <Users className="w-4 h-4" />,
      perform: () => router.push('/clients'),
    },
    {
      id: 'nav-settings',
      title: 'Go to Settings',
      subtitle: 'Studio identity, currency, and preferences',
      category: 'Navigation',
      icon: <Settings className="w-4 h-4" />,
      perform: () => router.push('/settings'),
    },

    // Actions
    {
      id: 'act-new-invoice',
      title: 'Create New Invoice',
      subtitle: 'Draft a client statement with line item calculations',
      category: 'Actions',
      icon: <Plus className="w-4 h-4" />,
      perform: () => {
        if (onOpenInvoiceModal) onOpenInvoiceModal()
      },
    },
    {
      id: 'act-new-client',
      title: 'Add New Client',
      subtitle: 'Register a new client company or counterparty',
      category: 'Actions',
      icon: <Users className="w-4 h-4" />,
      perform: () => {
        if (onOpenClientModal) onOpenClientModal()
      },
    },
    {
      id: 'act-export-json',
      title: 'Export Ledger Snapshot (JSON)',
      subtitle: 'Download complete studio records backup',
      category: 'Actions',
      icon: <Download className="w-4 h-4" />,
      perform: async () => {
        const invoices = await dbService.getInvoices()
        const clients = await dbService.getClients()
        const profile = await dbService.getProfile()
        const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({ profile, clients, invoices }, null, 2))
        const a = document.createElement('a')
        a.setAttribute('href', dataStr)
        a.setAttribute('download', `flowtrack_ledger_${new Date().toISOString().slice(0, 10)}.json`)
        document.body.appendChild(a)
        a.click()
        a.remove()
        success('Export Ready', 'Studio ledger downloaded as JSON.')
      },
    },

    // Theme & Ledger
    {
      id: 'thm-toggle',
      title: theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode',
      subtitle: 'Toggle monochrome visual canvas',
      category: 'Theme & Ledger',
      icon: theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />,
      perform: () => toggleTheme(),
    },
    {
      id: 'act-reset-demo',
      title: 'Reset Ledger Demo Data',
      subtitle: 'Restore fresh sample clients and invoice records',
      category: 'Theme & Ledger',
      icon: <RotateCcw className="w-4 h-4" />,
      perform: () => {
        dbService.resetDemoData()
        window.dispatchEvent(new CustomEvent('flowtrack_data_updated'))
        success('Demo Reset', 'Default ledger restored.')
      },
    },
  ]

  const filteredCommands = commands.filter((cmd) => {
    if (!query.trim()) return true
    const q = query.toLowerCase()
    return (
      cmd.title.toLowerCase().includes(q) ||
      (cmd.subtitle && cmd.subtitle.toLowerCase().includes(q)) ||
      cmd.category.toLowerCase().includes(q)
    )
  })

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      soundEngine.playClick()
      setSelectedIndex((prev) => (prev + 1) % (filteredCommands.length || 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      soundEngine.playClick()
      setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % (filteredCommands.length || 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (filteredCommands[selectedIndex]) {
        soundEngine.playSuccess()
        filteredCommands[selectedIndex].perform()
        onClose()
      }
    } else if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 sm:pt-28 p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-md"
          />

          {/* Modal Window */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -15 }}
            transition={{ type: 'spring', stiffness: 450, damping: 32 }}
            className="relative w-full max-w-xl rounded-2xl bg-white/95 dark:bg-[#121216]/95 border border-zinc-200 dark:border-white/[0.1] shadow-2xl backdrop-blur-2xl overflow-hidden z-10"
          >
            {/* Search Input Bar */}
            <div className="flex items-center px-4 py-3.5 border-b border-zinc-200/80 dark:border-white/[0.08] gap-3">
              <Search className="w-4 h-4 text-zinc-400 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setSelectedIndex(0)
                }}
                onKeyDown={handleKeyDown}
                placeholder="Type a command or search..."
                className="w-full bg-transparent text-sm text-zinc-950 dark:text-white placeholder:text-zinc-400 focus:outline-none font-medium"
              />
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-zinc-400 dark:text-zinc-500 bg-zinc-100 dark:bg-white/[0.06] border border-zinc-200 dark:border-white/[0.08] rounded">
                ESC
              </kbd>
            </div>

            {/* Command List */}
            <div className="max-h-80 overflow-y-auto p-2 space-y-1">
              {filteredCommands.length === 0 ? (
                <div className="py-8 text-center text-xs text-zinc-400 font-mono">
                  No matching commands found
                </div>
              ) : (
                filteredCommands.map((cmd, idx) => {
                  const isSelected = idx === selectedIndex
                  return (
                    <button
                      key={cmd.id}
                      onClick={() => {
                        soundEngine.playSuccess()
                        cmd.perform()
                        onClose()
                      }}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 shadow-xs'
                          : 'text-zinc-700 dark:text-zinc-300 hover:bg-black/[0.04] dark:hover:bg-white/[0.05]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                            isSelected
                              ? 'bg-white/20 text-white dark:bg-black/10 dark:text-zinc-950'
                              : 'bg-black/[0.04] dark:bg-white/[0.06] text-zinc-500 dark:text-zinc-400'
                          }`}
                        >
                          {cmd.icon}
                        </div>
                        <div>
                          <p className="text-xs font-bold font-mono tracking-tight">{cmd.title}</p>
                          {cmd.subtitle && (
                            <p
                              className={`text-[11px] truncate max-w-sm ${
                                isSelected
                                  ? 'text-white/70 dark:text-zinc-950/70'
                                  : 'text-zinc-400 dark:text-zinc-500'
                              }`}
                            >
                              {cmd.subtitle}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-md ${
                            isSelected
                              ? 'bg-white/20 text-white dark:bg-black/10 dark:text-zinc-950'
                              : 'text-zinc-400 dark:text-zinc-500'
                          }`}
                        >
                          {cmd.category}
                        </span>
                        {isSelected && <ArrowRight className="w-3.5 h-3.5 shrink-0" />}
                      </div>
                    </button>
                  )
                })
              )}
            </div>

            {/* Footer Shortcut Legend */}
            <div className="px-4 py-2 bg-black/[0.02] dark:bg-white/[0.02] border-t border-zinc-200/80 dark:border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-zinc-400">
              <div className="flex items-center gap-3">
                <span>↑↓ Navigate</span>
                <span>↵ Select</span>
                <span>ESC Dismiss</span>
              </div>
              <div className="flex items-center gap-1">
                <Command className="w-3 h-3" />
                <span>Command Palette</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
