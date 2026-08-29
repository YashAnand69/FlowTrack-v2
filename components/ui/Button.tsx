'use client'

import React, { forwardRef } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg' | 'icon'
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const shouldReduceMotion = useReducedMotion()

    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-xl transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 disabled:opacity-40 disabled:pointer-events-none cursor-pointer select-none'

    const variants = {
      primary:
        'bg-zinc-950 hover:bg-zinc-900 text-white dark:bg-white dark:hover:bg-zinc-100 dark:text-zinc-950 font-semibold shadow-[0_2px_8px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.2)] dark:shadow-[0_0_20px_rgba(255,255,255,0.12),inset_0_1px_0_rgba(255,255,255,0.8)] border border-transparent',
      secondary:
        'bg-zinc-100 hover:bg-zinc-200 text-zinc-900 dark:bg-zinc-800/80 dark:hover:bg-zinc-700/80 dark:text-zinc-100 border border-zinc-200/60 dark:border-zinc-700/50 backdrop-blur-md',
      outline:
        'border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 backdrop-blur-md',
      ghost:
        'hover:bg-zinc-100 dark:hover:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100',
      danger:
        'bg-rose-600 hover:bg-rose-700 text-white shadow-xs dark:bg-rose-600 dark:hover:bg-rose-500',
    }

    const sizes = {
      sm: 'text-xs px-3 py-1.5 gap-1.5 h-8',
      md: 'text-xs px-4 py-2 gap-2 h-10 tracking-tight',
      lg: 'text-sm px-5 py-2.5 gap-2.5 h-11 tracking-tight',
      icon: 'h-9 w-9 p-0',
    }

    return (
      <motion.button
        ref={ref as any}
        disabled={disabled || isLoading}
        whileHover={shouldReduceMotion || disabled || isLoading ? {} : { scale: 1.02 }}
        whileTap={shouldReduceMotion || disabled || isLoading ? {} : { scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...(props as any)}
      >
        {isLoading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        {children}
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </motion.button>
    )
  }
)

Button.displayName = 'Button'
