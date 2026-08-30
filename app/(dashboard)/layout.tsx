'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/layout/Sidebar'
import { TopBar } from '@/components/layout/TopBar'
import { MobileNav } from '@/components/layout/MobileNav'
import { InvoiceModal } from '@/components/invoices/InvoiceModal'
import { ClientModal } from '@/components/clients/ClientModal'
import { InvoicePreviewModal } from '@/components/invoices/InvoicePreviewModal'
import { CommandPalette } from '@/components/ui/CommandPalette'
import { dbService } from '@/lib/supabase/db-service'
import { useAuth } from '@/lib/context/AuthContext'
import type { Client, InvoiceWithDetails } from '@/lib/supabase/database.types'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { user, isLoading } = useAuth()

  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false)
  const [isClientModalOpen, setIsClientModalOpen] = useState(false)
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false)
  const [previewInvoice, setPreviewInvoice] = useState<InvoiceWithDetails | null>(null)
  const [invoiceToEdit, setInvoiceToEdit] = useState<InvoiceWithDetails | null>(null)
  const [clients, setClients] = useState<Client[]>([])

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login')
    }
  }, [user, isLoading, router])

  // Global ⌘K / Ctrl+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsCommandPaletteOpen((prev) => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    async function fetchClients() {
      if (user) {
        try {
          const list = await dbService.getClients(user.id)
          setClients(list)
        } catch (e) {
          console.error(e)
        }
      }
    }
    fetchClients()
  }, [user, isClientModalOpen, isInvoiceModalOpen])

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fbfbfb] dark:bg-[#09090b]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 flex items-center justify-center font-bold text-xs shadow-md">
            FT
          </div>
          <span className="text-xs font-mono font-semibold text-zinc-400">Loading FlowTrack Studio...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-transparent text-zinc-900 dark:text-zinc-100 flex flex-col md:flex-row">
      {/* Fixed Left Sidebar */}
      <Sidebar
        onOpenInvoiceModal={() => {
          setInvoiceToEdit(null)
          setIsInvoiceModalOpen(true)
        }}
      />

      {/* Mobile Top Navigation */}
      <MobileNav
        onOpenInvoiceModal={() => {
          setInvoiceToEdit(null)
          setIsInvoiceModalOpen(true)
        }}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:pl-64 transition-all duration-200">
        <TopBar
          onOpenInvoiceModal={() => {
            setInvoiceToEdit(null)
            setIsInvoiceModalOpen(true)
          }}
          onOpenClientModal={() => setIsClientModalOpen(true)}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        />

        <main className="flex-1 p-5 sm:p-8 md:p-10 max-w-7xl w-full mx-auto relative z-10">
          {children}
        </main>
      </div>

      {/* Spotlight Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onOpenInvoiceModal={() => {
          setInvoiceToEdit(null)
          setIsInvoiceModalOpen(true)
        }}
        onOpenClientModal={() => setIsClientModalOpen(true)}
      />

      {/* Global Quick Action Modals */}
      <InvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        invoiceToEdit={invoiceToEdit}
        clients={clients}
        onSuccess={() => {
          window.dispatchEvent(new CustomEvent('flowtrack_data_updated'))
        }}
        onOpenAddClient={() => {
          setIsInvoiceModalOpen(false)
          setIsClientModalOpen(true)
        }}
      />

      <ClientModal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        onSuccess={() => {
          window.dispatchEvent(new CustomEvent('flowtrack_data_updated'))
        }}
      />

      <InvoicePreviewModal
        invoice={previewInvoice}
        isOpen={Boolean(previewInvoice)}
        onClose={() => setPreviewInvoice(null)}
        onEditInvoice={(inv) => {
          setPreviewInvoice(null)
          setInvoiceToEdit(inv)
          setIsInvoiceModalOpen(true)
        }}
      />
    </div>
  )
}
