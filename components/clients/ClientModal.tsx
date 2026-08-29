'use client'

import React, { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { validateClientForm } from '@/lib/utils/validation'
import { dbService } from '@/lib/supabase/db-service'
import { useToast } from '@/lib/context/ToastContext'
import { useAuth } from '@/lib/context/AuthContext'
import type { Client } from '@/lib/supabase/database.types'

interface ClientModalProps {
  isOpen: boolean
  onClose: () => void
  clientToEdit?: Client | null
  onSuccess: (client: Client) => void
}

export function ClientModal({
  isOpen,
  onClose,
  clientToEdit,
  onSuccess,
}: ClientModalProps) {
  const { user } = useAuth()
  const { success, error: toastError } = useToast()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [company, setCompany] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (clientToEdit) {
      setName(clientToEdit.name)
      setEmail(clientToEdit.email)
      setCompany(clientToEdit.company || '')
      setPhone(clientToEdit.phone || '')
      setAddress(clientToEdit.address || '')
    } else {
      setName('')
      setEmail('')
      setCompany('')
      setPhone('')
      setAddress('')
    }
    setErrors({})
  }, [clientToEdit, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const validationErrors = validateClientForm({ name, email, company, phone, address })

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setIsSubmitting(true)
    try {
      if (clientToEdit) {
        const updated = await dbService.updateClient(clientToEdit.id, {
          name,
          email,
          company,
          phone,
          address,
        })
        success('Client updated', `${updated.name} has been modified.`)
        onSuccess(updated)
      } else {
        const created = await dbService.createClient({
          user_id: user?.id || 'demo-user-id',
          name,
          email,
          company,
          phone,
          address,
        })
        success('Client onboarded', `${created.name} registered.`)
        onSuccess(created)
      }
      onClose()
    } catch (err: any) {
      toastError('Failed to save client', err.message || 'An error occurred.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={clientToEdit ? `Edit Client: ${clientToEdit.name}` : 'Onboard New Client'}
      description="Register counterparties to issue invoices and track lifetime settlements."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="FULL NAME / CONTACT PERSON *"
          placeholder="e.g. Elena Rostova"
          value={name}
          onChange={(e) => {
            setName(e.target.value)
            if (errors.name) setErrors({ ...errors, name: '' })
          }}
          error={errors.name}
          autoFocus
        />

        <Input
          label="COMPANY / ORGANIZATION"
          placeholder="e.g. Apex Holdings Ltd."
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        />

        <Input
          label="BILLING EMAIL ADDRESS *"
          type="email"
          placeholder="e.g. billing@apexholdings.io"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            if (errors.email) setErrors({ ...errors, email: '' })
          }}
          error={errors.email}
        />

        <Input
          label="PHONE NUMBER"
          placeholder="e.g. +1 (555) 234-5678"
          value={phone}
          onChange={(e) => {
            setPhone(e.target.value)
            if (errors.phone) setErrors({ ...errors, phone: '' })
          }}
          error={errors.phone}
        />

        <div className="space-y-1.5">
          <label className="block text-xs font-mono font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
            MAILING / BILLING ADDRESS
          </label>
          <textarea
            rows={2}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="100 Montgomery St, Suite 400, San Francisco, CA"
            className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200/80 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 font-medium"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-white/[0.06]">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {clientToEdit ? 'Update Client' : 'Add Client'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
