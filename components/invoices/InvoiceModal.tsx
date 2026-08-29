'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Trash2, Calculator } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { validateInvoiceForm, type InvoiceItemInput } from '@/lib/utils/validation'
import { formatCurrency, generateInvoiceNumber } from '@/lib/utils/formatters'
import { dbService } from '@/lib/supabase/db-service'
import { useToast } from '@/lib/context/ToastContext'
import { useAuth } from '@/lib/context/AuthContext'
import type { Client, InvoiceWithDetails, InvoiceStatus } from '@/lib/supabase/database.types'

interface InvoiceModalProps {
  isOpen: boolean
  onClose: () => void
  invoiceToEdit?: InvoiceWithDetails | null
  preselectedClientId?: string
  clients: Client[]
  existingInvoicesCount?: number
  onSuccess: (invoice: InvoiceWithDetails) => void
  onOpenAddClient?: () => void
}

export function InvoiceModal({
  isOpen,
  onClose,
  invoiceToEdit,
  preselectedClientId,
  clients,
  existingInvoicesCount = 0,
  onSuccess,
  onOpenAddClient,
}: InvoiceModalProps) {
  const { user, profile } = useAuth()
  const { success, error: toastError } = useToast()
  const currency = profile?.currency || 'USD'

  const [clientId, setClientId] = useState('')
  const [invoiceNumber, setInvoiceNumber] = useState('')
  const [status, setStatus] = useState<InvoiceStatus>('draft')
  const [issueDate, setIssueDate] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [notes, setNotes] = useState('')
  const [items, setItems] = useState<InvoiceItemInput[]>([
    { description: '', quantity: 1, rate: 0 },
  ])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (invoiceToEdit) {
      setClientId(invoiceToEdit.client_id)
      setInvoiceNumber(invoiceToEdit.invoice_number)
      setStatus(invoiceToEdit.status)
      setIssueDate(invoiceToEdit.issue_date.split('T')[0])
      setDueDate(invoiceToEdit.due_date.split('T')[0])
      setNotes(invoiceToEdit.notes || '')
      setItems(
        invoiceToEdit.items && invoiceToEdit.items.length > 0
          ? invoiceToEdit.items.map((it) => ({
              description: it.description,
              quantity: Number(it.quantity),
              rate: Number(it.rate),
            }))
          : [{ description: '', quantity: 1, rate: 0 }]
      )
    } else {
      const today = new Date().toISOString().split('T')[0]
      const twoWeeksLater = new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]
      setClientId(preselectedClientId || (clients[0]?.id || ''))
      setInvoiceNumber(generateInvoiceNumber(existingInvoicesCount))
      setStatus('draft')
      setIssueDate(today)
      setDueDate(twoWeeksLater)
      setNotes(profile?.payment_terms || 'Payment due within 14 days of invoice date.')
      setItems([{ description: '', quantity: 1, rate: 0 }])
    }
    setErrors({})
  }, [invoiceToEdit, isOpen, preselectedClientId, clients, existingInvoicesCount, profile])

  const subtotal = items.reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.rate) || 0), 0)
  const taxRate = Number(profile?.tax_rate) || 0
  const taxAmount = (subtotal * taxRate) / 100
  const total = subtotal + taxAmount

  const handleAddItem = () => {
    setItems([...items, { description: '', quantity: 1, rate: 0 }])
  }

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return
    setItems(items.filter((_, i) => i !== index))
  }

  const handleItemChange = (index: number, field: keyof InvoiceItemInput, val: any) => {
    const next = [...items]
    next[index] = {
      ...next[index],
      [field]: field === 'description' ? val : Number(val) || 0,
    }
    setItems(next)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const validationErrors = validateInvoiceForm({
      client_id: clientId,
      invoice_number: invoiceNumber,
      issue_date: issueDate,
      due_date: dueDate,
      notes,
      items,
    })

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setIsSubmitting(true)
    try {
      if (invoiceToEdit) {
        const updated = await dbService.updateInvoice(
          invoiceToEdit.id,
          {
            client_id: clientId,
            invoice_number: invoiceNumber,
            status,
            issue_date: issueDate,
            due_date: dueDate,
            notes,
          },
          items.map((it) => ({
            description: it.description,
            quantity: it.quantity,
            rate: it.rate,
            amount: it.quantity * it.rate,
          }))
        )
        success('Invoice updated', `Invoice ${updated.invoice_number} saved.`)
        onSuccess(updated)
      } else {
        const created = await dbService.createInvoice(
          {
            user_id: user?.id || 'demo-user-id',
            client_id: clientId,
            invoice_number: invoiceNumber,
            status,
            issue_date: issueDate,
            due_date: dueDate,
            notes,
          },
          items.map((it) => ({
            description: it.description,
            quantity: it.quantity,
            rate: it.rate,
            amount: it.quantity * it.rate,
          }))
        )
        success('Invoice created', `Invoice ${created.invoice_number} generated.`)
        onSuccess(created)
      }
      onClose()
    } catch (err: any) {
      toastError('Failed to save invoice', err.message || 'An error occurred.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={invoiceToEdit ? `Edit Statement (${invoiceToEdit.invoice_number})` : 'New Invoice Statement'}
      description="Configure counterparty details, issue schedule, and dynamic ledger line items."
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Row 1: Client & Invoice Number */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                Counterparty / Client *
              </label>
              {onOpenAddClient && (
                <button
                  type="button"
                  onClick={onOpenAddClient}
                  className="text-[11px] font-mono text-zinc-950 dark:text-white underline hover:opacity-75 cursor-pointer"
                >
                  + Add Client
                </button>
              )}
            </div>
            <select
              value={clientId}
              onChange={(e) => {
                setClientId(e.target.value)
                if (errors.client_id) setErrors({ ...errors, client_id: '' })
              }}
              className="w-full h-10 px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-zinc-400 cursor-pointer font-medium"
            >
              <option value="">Select a counterparty...</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id} className="bg-white dark:bg-zinc-900">
                  {c.company ? `${c.company} (${c.name})` : c.name}
                </option>
              ))}
            </select>
            {errors.client_id && (
              <p className="text-xs text-rose-600 mt-1 font-mono">{errors.client_id}</p>
            )}
          </div>

          <Input
            label="INVOICE IDENTIFIER *"
            value={invoiceNumber}
            onChange={(e) => {
              setInvoiceNumber(e.target.value)
              if (errors.invoice_number) setErrors({ ...errors, invoice_number: '' })
            }}
            error={errors.invoice_number}
          />
        </div>

        {/* Row 2: Status, Issue Date, Due Date */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select
            label="SETTLEMENT STATUS"
            value={status}
            onChange={(e) => setStatus(e.target.value as InvoiceStatus)}
            options={[
              { value: 'draft', label: 'Draft' },
              { value: 'sent', label: 'Sent' },
              { value: 'paid', label: 'Paid' },
              { value: 'overdue', label: 'Overdue' },
            ]}
          />

          <Input
            label="ISSUE DATE *"
            type="date"
            value={issueDate}
            onChange={(e) => {
              setIssueDate(e.target.value)
              if (errors.issue_date) setErrors({ ...errors, issue_date: '' })
            }}
            error={errors.issue_date}
          />

          <Input
            label="DUE DATE *"
            type="date"
            value={dueDate}
            onChange={(e) => {
              setDueDate(e.target.value)
              if (errors.due_date) setErrors({ ...errors, due_date: '' })
            }}
            error={errors.due_date}
          />
        </div>

        {/* Line Items Section */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h4 className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-400">
              Deliverable Items
            </h4>
            <span className="text-[11px] font-mono text-zinc-400">
              {items.length} {items.length === 1 ? 'entry' : 'entries'}
            </span>
          </div>

          {errors.items && (
            <p className="text-xs text-rose-600 font-mono font-medium">{errors.items}</p>
          )}

          <div className="space-y-2">
            {items.map((item, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl border border-zinc-200 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02] flex flex-col sm:flex-row items-start sm:items-center gap-2.5"
              >
                {/* Description */}
                <div className="flex-1 w-full">
                  <input
                    type="text"
                    placeholder="Item description"
                    value={item.description}
                    onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                    className="w-full h-9 px-3 text-xs rounded-lg border border-zinc-200/80 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 font-medium"
                  />
                  {errors[`item_${idx}_desc`] && (
                    <p className="text-[11px] font-mono text-rose-600 mt-0.5">
                      {errors[`item_${idx}_desc`]}
                    </p>
                  )}
                </div>

                {/* Qty & Rate */}
                <div className="flex items-center gap-2 w-full sm:w-auto font-mono text-xs">
                  <div className="w-16">
                    <input
                      type="number"
                      min="1"
                      placeholder="Qty"
                      value={item.quantity || ''}
                      onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                      className="w-full h-9 px-2 text-xs rounded-lg border border-zinc-200/80 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] text-zinc-900 dark:text-white text-center focus:outline-none focus:ring-1 focus:ring-zinc-400 tabular-nums"
                    />
                  </div>

                  <div className="w-24">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Rate"
                      value={item.rate || ''}
                      onChange={(e) => handleItemChange(idx, 'rate', e.target.value)}
                      className="w-full h-9 px-2 text-xs rounded-lg border border-zinc-200/80 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] text-zinc-900 dark:text-white text-right focus:outline-none focus:ring-1 focus:ring-zinc-400 tabular-nums"
                    />
                  </div>

                  {/* Computed line amount */}
                  <div className="w-24 text-right font-bold text-xs text-zinc-950 dark:text-white tabular-nums">
                    {formatCurrency((item.quantity || 0) * (item.rate || 0), currency)}
                  </div>

                  {/* Remove item */}
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(idx)}
                    disabled={items.length <= 1}
                    className="p-1.5 text-zinc-400 hover:text-rose-600 disabled:opacity-20 disabled:pointer-events-none rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddItem}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Add Line Entry
          </Button>
        </div>

        {/* Calculation Summary Card */}
        <div className="p-4 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-zinc-200 dark:border-white/10 space-y-2 text-xs font-mono">
          <div className="flex justify-between text-zinc-500">
            <span>Subtotal</span>
            <span className="font-bold text-zinc-950 dark:text-white tabular-nums">
              {formatCurrency(subtotal, currency)}
            </span>
          </div>

          {taxRate > 0 && (
            <div className="flex justify-between text-zinc-500">
              <span>Tax ({taxRate}%)</span>
              <span className="font-bold text-zinc-950 dark:text-white tabular-nums">
                {formatCurrency(taxAmount, currency)}
              </span>
            </div>
          )}

          <div className="pt-2 border-t border-zinc-200 dark:border-white/10 flex justify-between text-sm font-extrabold text-zinc-950 dark:text-white">
            <span>Total Settlement</span>
            <span className="text-base tabular-nums">
              {formatCurrency(total, currency)}
            </span>
          </div>
        </div>

        {/* Notes & Payment Terms */}
        <div className="space-y-1.5">
          <label className="block text-xs font-mono font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
            TERMS & BANK WIRE INSTRUCTIONS
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Payment instructions or terms..."
            className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200/80 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 font-medium"
          />
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-white/[0.06]">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {invoiceToEdit ? 'Save Statement' : 'Generate Invoice'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
