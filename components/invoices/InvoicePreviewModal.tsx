'use client'

import React, { useState } from 'react'
import { Printer, Copy, Check, CheckCheck, Building2 } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { InvoiceStatusBadge } from './InvoiceStatusBadge'
import { formatCurrency, formatDate } from '@/lib/utils/formatters'
import { useAuth } from '@/lib/context/AuthContext'
import { useToast } from '@/lib/context/ToastContext'
import { dbService } from '@/lib/supabase/db-service'
import { soundEngine } from '@/lib/utils/haptics'
import type { InvoiceWithDetails } from '@/lib/supabase/database.types'

interface InvoicePreviewModalProps {
  invoice: InvoiceWithDetails | null
  isOpen: boolean
  onClose: () => void
  onEditInvoice?: (invoice: InvoiceWithDetails) => void
}

export function InvoicePreviewModal({
  invoice,
  isOpen,
  onClose,
  onEditInvoice,
}: InvoicePreviewModalProps) {
  const { profile, user } = useAuth()
  const { success } = useToast()
  const [isCopied, setIsCopied] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const currency = profile?.currency || 'USD'

  if (!invoice) return null

  const handlePrint = () => {
    soundEngine.playChime()
    window.print()
  }

  const handleCopyLink = () => {
    soundEngine.playClick()
    const dummyPaymentLink = `${window.location.origin}/invoices?id=${invoice.id}&pay=true`
    navigator.clipboard.writeText(dummyPaymentLink)
    setIsCopied(true)
    success('Payment Link Copied', 'Direct settlement link copied to clipboard.')
    setTimeout(() => setIsCopied(false), 2000)
  }

  const handleMarkAsPaid = async () => {
    soundEngine.playSuccess()
    setIsUpdating(true)
    try {
      await dbService.markInvoiceAsPaid(invoice.id, user?.id)
      window.dispatchEvent(new CustomEvent('flowtrack_data_updated'))
      success('Invoice Settled', `Invoice ${invoice.invoice_number} marked as Paid.`)
      onClose()
    } catch {
      //
    } finally {
      setIsUpdating(false)
    }
  }

  const businessName = profile?.business_name || 'Rivera Design Studio'
  const businessEmail = profile?.business_email || 'alex@riveradesign.co'

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Statement ${invoice.invoice_number}`}
      description="Official ledger settlement and transaction statement."
      maxWidth="3xl"
    >
      <div className="space-y-6">
        {/* Actions Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 no-print pb-3 border-b border-zinc-200 dark:border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <InvoiceStatusBadge status={invoice.status} />
            {invoice.status !== 'paid' && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAsPaid}
                isLoading={isUpdating}
                leftIcon={<CheckCheck className="w-3.5 h-3.5" />}
              >
                Mark Paid
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyLink}
              leftIcon={isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            >
              {isCopied ? 'Link Copied' : 'Share Link'}
            </Button>

            {onEditInvoice && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onClose()
                  onEditInvoice(invoice)
                }}
              >
                Edit
              </Button>
            )}

            <Button
              size="sm"
              onClick={handlePrint}
              leftIcon={<Printer className="w-3.5 h-3.5" />}
            >
              Print / Save PDF
            </Button>
          </div>
        </div>

        {/* Printable Invoice Sheet */}
        <div className="bg-white text-zinc-950 dark:bg-[#0e0e12] dark:text-white p-6 sm:p-8 rounded-2xl border border-zinc-200 dark:border-white/10 shadow-sm space-y-8 print:border-none print:shadow-none">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
              <div className="w-10 h-10 rounded-xl bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 flex items-center justify-center font-mono font-bold text-base mb-2 shadow-sm">
                FT
              </div>
              <h3 className="text-lg font-bold tracking-tight text-zinc-950 dark:text-white font-mono">
                {businessName}
              </h3>
              <p className="text-xs text-zinc-400 font-mono mt-0.5">{businessEmail}</p>
            </div>

            <div className="text-left sm:text-right font-mono">
              <h2 className="text-2xl font-black tracking-tight text-zinc-950 dark:text-white">
                INVOICE
              </h2>
              <p className="text-xs font-bold text-zinc-500 mt-1">
                {invoice.invoice_number}
              </p>
              <div className="text-xs text-zinc-400 mt-2 space-y-0.5">
                <p>Issued: <span className="text-zinc-900 dark:text-zinc-100 font-semibold">{formatDate(invoice.issue_date)}</span></p>
                <p>Due: <span className="text-zinc-900 dark:text-zinc-100 font-semibold">{formatDate(invoice.due_date)}</span></p>
              </div>
            </div>
          </div>

          {/* Billed To */}
          <div className="pt-4 border-t border-zinc-200 dark:border-white/[0.08]">
            <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
              Counterparty:
            </p>
            <p className="text-sm font-bold text-zinc-950 dark:text-white">
              {invoice.client?.company || invoice.client?.name || 'Client Name'}
            </p>
            {invoice.client?.company && invoice.client?.name && (
              <p className="text-xs text-zinc-500 mt-0.5">
                Attn: {invoice.client.name}
              </p>
            )}
            {invoice.client?.email && (
              <p className="text-xs text-zinc-400 font-mono mt-0.5">{invoice.client.email}</p>
            )}
            {invoice.client?.address && (
              <p className="text-xs text-zinc-400 mt-0.5">{invoice.client.address}</p>
            )}
          </div>

          {/* Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b-2 border-zinc-900 dark:border-white text-zinc-400 uppercase text-[10px] tracking-wider">
                  <th className="py-2.5">Item Description</th>
                  <th className="py-2.5 text-center w-16">Units</th>
                  <th className="py-2.5 text-right w-24">Rate</th>
                  <th className="py-2.5 text-right w-28">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-white/[0.06]">
                {invoice.items?.map((item) => (
                  <tr key={item.id}>
                    <td className="py-3 font-medium text-zinc-900 dark:text-zinc-100">
                      {item.description}
                    </td>
                    <td className="py-3 text-center text-zinc-500">
                      {item.quantity}
                    </td>
                    <td className="py-3 text-right text-zinc-500 tabular-nums">
                      {formatCurrency(Number(item.rate), currency)}
                    </td>
                    <td className="py-3 text-right font-bold text-zinc-950 dark:text-white tabular-nums">
                      {formatCurrency(Number(item.amount), currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Total & Notes */}
          <div className="pt-4 border-t-2 border-zinc-900 dark:border-white flex flex-col sm:flex-row justify-between items-start gap-4">
            <div className="max-w-xs">
              <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">
                Notes & Terms:
              </p>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">
                {invoice.notes || 'Thank you for your business.'}
              </p>
            </div>

            <div className="w-full sm:w-60 space-y-2 text-xs font-mono">
              <div className="flex justify-between font-bold text-sm text-zinc-950 dark:text-white pt-2">
                <span>Total Due:</span>
                <span className="text-base font-black tabular-nums">
                  {formatCurrency(invoice.total_amount || 0, currency)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  )
}
