'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, useReducedMotion } from 'framer-motion'
import { InvoicesTable } from '@/components/invoices/InvoicesTable'
import { InvoiceModal } from '@/components/invoices/InvoiceModal'
import { InvoicePreviewModal } from '@/components/invoices/InvoicePreviewModal'
import { ClientModal } from '@/components/clients/ClientModal'
import { Skeleton } from '@/components/ui/Skeleton'
import { dbService } from '@/lib/supabase/db-service'
import { useAuth } from '@/lib/context/AuthContext'
import { useToast } from '@/lib/context/ToastContext'
import type { Client, InvoiceWithDetails } from '@/lib/supabase/database.types'

export default function InvoicesPage() {
  const { user } = useAuth()
  const { success, error: toastError } = useToast()
  const searchParams = useSearchParams()
  const shouldReduceMotion = useReducedMotion()

  const [invoices, setInvoices] = useState<InvoiceWithDetails[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Modals
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false)
  const [invoiceToEdit, setInvoiceToEdit] = useState<InvoiceWithDetails | null>(null)
  const [previewInvoice, setPreviewInvoice] = useState<InvoiceWithDetails | null>(null)
  const [isClientModalOpen, setIsClientModalOpen] = useState(false)

  const loadData = useCallback(async () => {
    try {
      const [invoiceList, clientList] = await Promise.all([
        dbService.getInvoices(user?.id),
        dbService.getClients(user?.id),
      ])
      setInvoices(invoiceList)
      setClients(clientList)
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    loadData()

    const handleUpdate = () => loadData()
    window.addEventListener('flowtrack_data_updated', handleUpdate)
    return () => window.removeEventListener('flowtrack_data_updated', handleUpdate)
  }, [loadData])

  useEffect(() => {
    if (searchParams.get('create') === 'true') {
      setInvoiceToEdit(null)
      setIsInvoiceModalOpen(true)
    }
  }, [searchParams])

  const handleDeleteInvoice = async (id: string) => {
    try {
      await dbService.deleteInvoice(id)
      success('Invoice deleted', 'The invoice record was removed.')
      loadData()
    } catch (err: any) {
      toastError('Failed to delete invoice', err.message)
    }
  }

  const handleMarkAsPaid = async (id: string) => {
    try {
      const updated = await dbService.markInvoiceAsPaid(id)
      success('Settlement Recorded', `Invoice ${updated.invoice_number} marked as Paid.`)
      loadData()
    } catch (err: any) {
      toastError('Failed to mark invoice as paid', err.message)
    }
  }

  return (
    <motion.div
      initial={shouldReduceMotion ? {} : { opacity: 0, y: 10 }}
      animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
            Settlement Ledgers
          </h1>
          <p className="text-xs text-zinc-400 mt-1 font-mono">
            Issue invoices, monitor status lifecycle, and record multi-currency settlements
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Skeleton className="h-10 w-72 rounded-xl" />
            <Skeleton className="h-10 w-32 rounded-xl" />
          </div>
          <div className="glass-card rounded-2xl p-6 space-y-4">
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        </div>
      ) : (
        <InvoicesTable
          invoices={invoices}
          onSelectInvoice={(inv) => setPreviewInvoice(inv)}
          onEditInvoice={(inv) => {
            setInvoiceToEdit(inv)
            setIsInvoiceModalOpen(true)
          }}
          onDeleteInvoice={handleDeleteInvoice}
          onMarkAsPaid={handleMarkAsPaid}
          onNewInvoice={() => {
            setInvoiceToEdit(null)
            setIsInvoiceModalOpen(true)
          }}
        />
      )}

      {/* Modals */}
      <InvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        invoiceToEdit={invoiceToEdit}
        clients={clients}
        existingInvoicesCount={invoices.length}
        onSuccess={() => loadData()}
        onOpenAddClient={() => {
          setIsInvoiceModalOpen(false)
          setIsClientModalOpen(true)
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

      <ClientModal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        onSuccess={() => loadData()}
      />
    </motion.div>
  )
}
