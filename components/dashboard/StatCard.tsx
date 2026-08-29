'use client'

import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { CountUpNumber } from '@/components/ui/CountUpNumber'
import { LiquidCard } from '@/components/ui/LiquidCard'
import { cn } from '@/lib/utils/cn'

interface StatCardProps {
  title: string
  numericValue?: number
  currencySymbol?: string
  value?: string
  trend?: number
  trendLabel?: string
  icon: React.ReactNode
  subtitle?: string
  delay?: number
}

export function StatCard({
  title,
  numericValue,
  currencySymbol = '',
  value,
  trend,
  trendLabel = 'vs last month',
  icon,
  subtitle,
  delay = 0,
}: StatCardProps) {
  const isPositive = trend !== undefined && trend >= 0
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      initial={shouldReduceMotion ? {} : { opacity: 0, y: 14, scale: 0.98 }}
      animate={shouldReduceMotion ? {} : { opacity: 1, y: 0, scale: 1 }}
      transition={{
        delay: delay * 0.06,
        type: 'spring',
        stiffness: 320,
        damping: 26,
      }}
      className="w-full"
    >
      <LiquidCard className="p-6 select-none" tiltStrength={6} glareOpacity={0.12}>
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-mono uppercase tracking-widest text-zinc-400 dark:text-zinc-500 font-semibold">
            {title}
          </p>
          <div className="w-8 h-8 rounded-xl bg-black/[0.04] dark:bg-white/[0.06] border border-black/5 dark:border-white/10 flex items-center justify-center text-zinc-800 dark:text-zinc-200 shrink-0 shadow-xs">
            {icon}
          </div>
        </div>

        <div className="mt-4 flex items-baseline justify-between gap-2">
          <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
            {numericValue !== undefined ? (
              <CountUpNumber
                value={numericValue}
                prefix={currencySymbol}
                decimals={numericValue % 1 !== 0 || currencySymbol ? 2 : 0}
              />
            ) : (
              <span className="tabular-nums font-mono">{value}</span>
            )}
          </div>
        </div>

        {trend !== undefined ? (
          <div className="mt-3.5 flex items-center gap-1.5 text-xs">
            <span
              className={cn(
                'inline-flex items-center gap-0.5 font-mono font-semibold px-2 py-0.5 rounded-md text-[11px] border',
                isPositive
                  ? 'text-zinc-950 bg-black/[0.05] dark:text-white dark:bg-white/[0.08] border-black/10 dark:border-white/15'
                  : 'text-zinc-500 bg-black/[0.02] dark:text-zinc-400 dark:bg-white/[0.03] border-black/5 dark:border-white/10'
              )}
            >
              {isPositive ? (
                <ArrowUpRight className="w-3 h-3 shrink-0" />
              ) : (
                <ArrowDownRight className="w-3 h-3 shrink-0" />
              )}
              {Math.abs(trend)}%
            </span>
            <span className="text-zinc-400 dark:text-zinc-500 text-[11px] font-mono">{trendLabel}</span>
          </div>
        ) : subtitle ? (
          <div className="mt-3.5 text-xs text-zinc-400 dark:text-zinc-500 font-mono text-[11px]">
            {subtitle}
          </div>
        ) : null}
      </LiquidCard>
    </motion.div>
  )
}
