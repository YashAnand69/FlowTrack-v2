'use client'

import React, { forwardRef } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export interface SelectOption {
  value: string
  label: string
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  helperText?: string
  options: SelectOption[]
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, helperText, options, id, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-xs font-mono font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300"
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          <select
            ref={ref}
            id={selectId}
            className={cn(
              'w-full h-10 pl-3 pr-10 py-2 text-xs rounded-xl border bg-white/70 dark:bg-[#101014] text-zinc-900 dark:text-white font-medium appearance-none transition-colors duration-150 cursor-pointer',
              'focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-white/30 focus:border-zinc-400 dark:focus:border-white/30',
              error
                ? 'border-rose-500 focus:border-rose-500'
                : 'border-zinc-200/80 dark:border-white/[0.08] hover:border-zinc-300 dark:hover:border-white/15',
              className
            )}
            {...props}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value} className="bg-white dark:bg-[#121216] text-zinc-900 dark:text-white">
                {option.label}
              </option>
            ))}
          </select>

          <div className="absolute right-3 pointer-events-none text-zinc-400">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>

        {error && (
          <p className="text-xs text-rose-600 dark:text-rose-400 font-medium tracking-tight font-mono">
            {error}
          </p>
        )}

        {!error && helperText && (
          <p className="text-[11px] text-zinc-400 font-mono">{helperText}</p>
        )}
      </div>
    )
  }
)

Select.displayName = 'Select'
