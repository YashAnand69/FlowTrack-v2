'use client'

import React from 'react'
import { cn } from '@/lib/utils/cn'
import type { InvoiceStatus } from '@/lib/supabase/database.types'

interface InvoiceStatusBadgeProps {
  status: InvoiceStatus
  className?: string
}

export function InvoiceStatusBadge({ status, className }: InvoiceStatusBadgeProps) {
  const configs: Record<
    InvoiceStatus,
    { label: string; bg: string; text: string; dot: string; border: string }
  > = {
    draft: {
      label: 'Draft',
      bg: 'bg-black/[0.04] dark:bg-white/[0.05]',
      text: 'text-zinc-600 dark:text-zinc-400',
      dot: 'bg-zinc-400',
      border: 'border-zinc-200 dark:border-white/[0.08]',
    },
    sent: {
      label: 'Sent',
      bg: 'bg-black/[0.06] dark:bg-white/[0.08]',
      text: 'text-zinc-800 dark:text-zinc-200',
      dot: 'bg-zinc-700 dark:bg-zinc-300',
      border: 'border-zinc-300 dark:border-white/15',
    },
    paid: {
      label: 'Paid',
      bg: 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950',
      text: 'font-semibold',
      dot: 'bg-emerald-400 dark:bg-emerald-600',
      border: 'border-transparent',
    },
    overdue: {
      label: 'Overdue',
      bg: 'bg-rose-50 dark:bg-rose-950/40',
      text: 'text-rose-700 dark:text-rose-400 font-medium',
      dot: 'bg-rose-500 dark:bg-rose-400',
      border: 'border-rose-200 dark:border-rose-800/40',
    },
  }

  const config = configs[status] || configs.draft

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono tracking-tight border select-none',
        config.bg,
        config.text,
        config.border,
        className
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', config.dot)} aria-hidden="true" />
      {config.label}
    </span>
  )
}
