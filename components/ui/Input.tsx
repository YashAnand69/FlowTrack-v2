'use client'

import React, { forwardRef } from 'react'
import { cn } from '@/lib/utils/cn'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, leftIcon, rightIcon, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-mono font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300"
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 text-zinc-400 pointer-events-none flex items-center justify-center">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full h-10 px-3 py-2 text-xs rounded-xl border bg-white/70 dark:bg-white/[0.03] text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 font-medium transition-colors duration-150',
              'focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-white/30 focus:border-zinc-400 dark:focus:border-white/30',
              error
                ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20'
                : 'border-zinc-200/80 dark:border-white/[0.08] hover:border-zinc-300 dark:hover:border-white/15',
              leftIcon ? 'pl-9' : '',
              rightIcon ? 'pr-9' : '',
              className
            )}
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-3 text-zinc-400 flex items-center justify-center">
              {rightIcon}
            </div>
          )}
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

Input.displayName = 'Input'
