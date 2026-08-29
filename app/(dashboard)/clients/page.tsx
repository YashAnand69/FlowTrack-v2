'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { ClientsTable } from '@/components/clients/ClientsTable'
import { ClientModal } from '@/components/clients/ClientModal'
import { ClientHistoryDrawer } from '@/components/clients/ClientHistoryDrawer'
import { InvoiceModal } from '@/components/invoices/InvoiceModal'
import { InvoicePreviewModal } from '@/components/invoices/InvoicePreviewModal'
import { Skeleton } from '@/components/ui/Skeleton'
import { dbService } from '@/lib/supabase/db-service'
import { useAuth } from '@/lib/context/AuthContext'
import { useToast } from '@/lib/context/ToastContext'
import type { Client, InvoiceWithDetails } from '@/lib/supabase/database.types'

export default function ClientsPage() {
  const { user } = useAuth()
  const { success, error: toastError } = useToast()
  const shouldReduceMotion = useReducedMotion()

  const [clients, setClients] = useState<Client[]>([])
  const [clientBilledMap, setClientBilledMap] = useState<
    Record<string, { totalBilled: number; invoiceCount: number }>
  >({})
  const [isLoading, setIsLoading] = useState(true)

  // Modals & Drawers
  const [isClientModalOpen, setIsClientModalOpen] = useState(false)
  const [clientToEdit, setClientToEdit] = useState<Client | null>(null)
  const [selectedClientForHistory, setSelectedClientForHistory] = useState<Client | null>(null)

  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false)
  const [preselectedClientId, setPreselectedClientId] = useState<string | undefined>(undefined)
  const [previewInvoice, setPreviewInvoice] = useState<InvoiceWithDetails | null>(null)

  const loadClientsData = useCallback(async () => {
    try {
      const [clientList, invoiceList] = await Promise.all([
        dbService.getClients(user?.id),
        dbService.getInvoices(user?.id),
      ])

      const map: Record<string, { totalBilled: number; invoiceCount: number }> = {}
      clientList.forEach((c) => {
        const clientInvoices = invoiceList.filter((i) => i.client_id === c.id)
        const totalBilled = clientInvoices.reduce((sum, i) => sum + (i.total_amount || 0), 0)
        map[c.id] = {
          totalBilled,
          invoiceCount: clientInvoices.length,
        }
      })

      setClients(clientList)
      setClientBilledMap(map)
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    loadClientsData()

    const handleUpdate = () => loadClientsData()
    window.addEventListener('flowtrack_data_updated', handleUpdate)
    return () => window.removeEventListener('flowtrack_data_updated', handleUpdate)
  }, [loadClientsData])

  const handleDeleteClient = async (id: string) => {
    try {
      await dbService.deleteClient(id)
      success('Client deleted', 'The client and their invoices were removed.')
      if (selectedClientForHistory?.id === id) {
        setSelectedClientForHistory(null)
      }
      loadClientsData()
    } catch (err: any) {
      toastError('Failed to delete client', err.message)
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
            Client Counterparties
          </h1>
          <p className="text-xs text-zinc-400 mt-1 font-mono">
            Client registry, communications, and historical billing statements
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Skeleton className="h-10 w-64 rounded-xl" />
            <Skeleton className="h-10 w-32 rounded-xl" />
          </div>
          <div className="glass-card rounded-2xl p-6 space-y-4">
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        </div>
      ) : (
        <ClientsTable
          clients={clients}
          clientBilledMap={clientBilledMap}
          onSelectClient={(c) => setSelectedClientForHistory(c)}
          onEditClient={(c) => {
            setClientToEdit(c)
            setIsClientModalOpen(true)
          }}
          onDeleteClient={handleDeleteClient}
          onAddClient={() => {
            setClientToEdit(null)
            setIsClientModalOpen(true)
          }}
        />
      )}

      {/* Modals & History Drawer */}
      <ClientModal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        clientToEdit={clientToEdit}
        onSuccess={() => loadClientsData()}
      />

      <ClientHistoryDrawer
        client={selectedClientForHistory}
        isOpen={Boolean(selectedClientForHistory)}
        onClose={() => setSelectedClientForHistory(null)}
        onEditClient={(c) => {
          setSelectedClientForHistory(null)
          setClientToEdit(c)
          setIsClientModalOpen(true)
        }}
        onCreateInvoiceForClient={(c) => {
          setSelectedClientForHistory(null)
          setPreselectedClientId(c.id)
          setIsInvoiceModalOpen(true)
        }}
        onViewInvoice={(inv) => {
          setSelectedClientForHistory(null)
          setPreviewInvoice(inv)
        }}
      />

      <InvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={() => {
          setIsInvoiceModalOpen(false)
          setPreselectedClientId(undefined)
        }}
        preselectedClientId={preselectedClientId}
        clients={clients}
        onSuccess={() => loadClientsData()}
      />

      <InvoicePreviewModal
        invoice={previewInvoice}
        isOpen={Boolean(previewInvoice)}
        onClose={() => setPreviewInvoice(null)}
      />
    </motion.div>
  )
}
