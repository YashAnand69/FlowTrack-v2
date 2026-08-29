'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import {
  DollarSign,
  Clock,
  Users,
  AlertCircle,
  Plus,
} from 'lucide-react'
import { StatCard } from '@/components/dashboard/StatCard'
import { RevenueChart } from '@/components/dashboard/RevenueChart'
import { RecentActivity } from '@/components/dashboard/RecentActivity'
import { EmptyState } from '@/components/dashboard/EmptyState'
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton'
import { InvoiceModal } from '@/components/invoices/InvoiceModal'
import { ClientModal } from '@/components/clients/ClientModal'
import { InvoicePreviewModal } from '@/components/invoices/InvoicePreviewModal'
import { CURRENCY_SYMBOLS } from '@/lib/utils/formatters'
import { dbService } from '@/lib/supabase/db-service'
import { useAuth } from '@/lib/context/AuthContext'
import { useToast } from '@/lib/context/ToastContext'
import type { Client, InvoiceWithDetails } from '@/lib/supabase/database.types'

export default function DashboardPage() {
  const { user, profile } = useAuth()
  const { success, error: toastError } = useToast()
  const shouldReduceMotion = useReducedMotion()
  const currency = profile?.currency || 'USD'
  const currencySymbol = CURRENCY_SYMBOLS[currency]?.symbol || '$'

  const [isLoading, setIsLoading] = useState(true)
  const [metrics, setMetrics] = useState<any>(null)
  const [clients, setClients] = useState<Client[]>([])

  // Modal states
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false)
  const [isClientModalOpen, setIsClientModalOpen] = useState(false)
  const [previewInvoice, setPreviewInvoice] = useState<InvoiceWithDetails | null>(null)
  const [invoiceToEdit, setInvoiceToEdit] = useState<InvoiceWithDetails | null>(null)

  const loadDashboardData = useCallback(async () => {
    try {
      const [m, c] = await Promise.all([
        dbService.getDashboardMetrics(user?.id),
        dbService.getClients(user?.id),
      ])
      setMetrics(m)
      setClients(c)
    } catch (e) {
      console.error('Error fetching dashboard data:', e)
    } finally {
      setIsLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    loadDashboardData()

    const handleUpdate = () => loadDashboardData()
    window.addEventListener('flowtrack_data_updated', handleUpdate)
    return () => window.removeEventListener('flowtrack_data_updated', handleUpdate)
  }, [loadDashboardData])

  const handleMarkAsPaid = async (id: string) => {
    try {
      const updated = await dbService.markInvoiceAsPaid(id)
      success('Invoice Marked as Paid', `${updated.invoice_number} has been settled.`)
      loadDashboardData()
    } catch (e: any) {
      toastError('Failed to update invoice', e.message)
    }
  }

  if (isLoading || !metrics) {
    return <DashboardSkeleton />
  }

  const hasData = metrics.totalInvoicesCount > 0 || clients.length > 0

  return (
    <motion.div
      initial={shouldReduceMotion ? {} : { opacity: 0, y: 10 }}
      animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
      className="space-y-8"
    >
      {/* Page Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
            Dashboard
          </h1>
          <p className="text-xs text-zinc-400 mt-1 font-mono">
            High-precision freelance ledger & client cashflow analytics
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <motion.button
            whileHover={shouldReduceMotion ? {} : { scale: 1.02 }}
            whileTap={shouldReduceMotion ? {} : { scale: 0.97 }}
            onClick={() => setIsClientModalOpen(true)}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-black/[0.04] dark:bg-white/[0.05] border border-black/5 dark:border-white/10 text-zinc-800 dark:text-zinc-200 hover:bg-black/[0.08] dark:hover:bg-white/[0.1] backdrop-blur-md shadow-xs transition-colors cursor-pointer"
          >
            + Add Client
          </motion.button>
          <motion.button
            whileHover={shouldReduceMotion ? {} : { scale: 1.02 }}
            whileTap={shouldReduceMotion ? {} : { scale: 0.97 }}
            onClick={() => {
              setInvoiceToEdit(null)
              setIsInvoiceModalOpen(true)
            }}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-zinc-950 text-white hover:bg-zinc-900 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100 shadow-xs transition-colors cursor-pointer"
          >
            + Create Invoice
          </motion.button>
        </div>
      </div>

      {!hasData ? (
        <EmptyState
          onCreateInvoice={() => {
            setInvoiceToEdit(null)
            setIsInvoiceModalOpen(true)
          }}
          onAddClient={() => setIsClientModalOpen(true)}
        />
      ) : (
        <>
          {/* Top 4 KPI Stat Cards with CountUp Physics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Total Revenue This Month */}
            <StatCard
              title="Revenue MTD"
              numericValue={metrics.revenueThisMonth}
              currencySymbol={currencySymbol}
              trend={metrics.revenueTrend}
              trendLabel="vs last month"
              delay={0}
              icon={<DollarSign className="w-4 h-4" />}
            />

            {/* 2. Outstanding Invoices */}
            <StatCard
              title="Outstanding"
              numericValue={metrics.outstandingAmount}
              currencySymbol={currencySymbol}
              subtitle={`${metrics.outstandingCount} unsettled ledgers`}
              delay={1}
              icon={<Clock className="w-4 h-4" />}
            />

            {/* 3. Active Clients */}
            <StatCard
              title="Active Counterparties"
              numericValue={metrics.activeClientsCount}
              subtitle="Registered clients"
              delay={2}
              icon={<Users className="w-4 h-4" />}
            />

            {/* 4. Overdue Amount */}
            <StatCard
              title="Overdue Balance"
              numericValue={metrics.overdueAmount}
              currencySymbol={currencySymbol}
              subtitle={`${metrics.overdueCount} require attention`}
              delay={3}
              icon={<AlertCircle className="w-4 h-4" />}
            />
          </div>

          {/* 6-Month Revenue Line Chart */}
          <RevenueChart data={metrics.chartData} />

          {/* Recent Activity List */}
          <RecentActivity
            invoices={metrics.recentActivity}
            onMarkAsPaid={handleMarkAsPaid}
            onViewInvoice={(inv) => setPreviewInvoice(inv)}
          />
        </>
      )}

      {/* Modals */}
      <InvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        invoiceToEdit={invoiceToEdit}
        clients={clients}
        onSuccess={() => loadDashboardData()}
        onOpenAddClient={() => {
          setIsInvoiceModalOpen(false)
          setIsClientModalOpen(true)
        }}
      />

      <ClientModal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        onSuccess={() => loadDashboardData()}
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
    </motion.div>
  )
}
