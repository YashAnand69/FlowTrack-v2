'use client'

import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import { formatCurrency } from '@/lib/utils/formatters'
import { useAuth } from '@/lib/context/AuthContext'
import { useTheme } from '@/lib/context/ThemeContext'

interface RevenueChartProps {
  data: Array<{
    month: string
    year: number
    revenue: number
  }>
}

export function RevenueChart({ data }: RevenueChartProps) {
  const { profile } = useAuth()
  const { theme } = useTheme()
  const shouldReduceMotion = useReducedMotion()
  const currency = profile?.currency || 'USD'
  const isDark = theme === 'dark'

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-zinc-950/95 dark:bg-[#151518]/95 text-white p-3 rounded-xl shadow-2xl border border-white/10 text-xs backdrop-blur-xl">
          <p className="font-mono text-zinc-400 text-[10px] uppercase tracking-wider">{label}</p>
          <p className="text-sm font-mono font-bold text-white mt-1">
            {formatCurrency(payload[0].value, currency)}
          </p>
          <p className="text-[10px] text-zinc-400 mt-0.5">Settled Ledger Revenue</p>
        </div>
      )
    }
    return null
  }

  const strokeColor = isDark ? '#ffffff' : '#09090b'

  return (
    <motion.div
      initial={shouldReduceMotion ? {} : { opacity: 0, y: 16 }}
      animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
      transition={{ delay: 0.2, type: 'spring', stiffness: 300, damping: 25 }}
      className="glass-card rounded-2xl p-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider font-mono text-zinc-950 dark:text-white">
            Revenue Performance
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5 font-normal">
            6-Month rolling settlement curve & cashflow velocity
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-zinc-700 dark:text-zinc-300 bg-black/[0.04] dark:bg-white/[0.06] border border-black/5 dark:border-white/10 px-2.5 py-1 rounded-lg">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-950 dark:bg-white shadow-[0_0_6px_rgba(255,255,255,0.8)]" />
            Monthly Settlements
          </span>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="monochromeRevenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={strokeColor} stopOpacity={isDark ? 0.2 : 0.12} />
                <stop offset="95%" stopColor={strokeColor} stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="currentColor"
              className="text-zinc-200/50 dark:text-zinc-800/40"
            />

            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tick={{ fill: isDark ? '#71717a' : '#a1a1aa', fontSize: 11, fontFamily: 'monospace' }}
              dy={10}
            />

            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: isDark ? '#71717a' : '#a1a1aa', fontSize: 11, fontFamily: 'monospace' }}
              tickFormatter={(val) => {
                if (val >= 1000) return `${val / 1000}k`
                return val
              }}
              dx={-5}
            />

            <Tooltip content={<CustomTooltip />} />

            <Area
              type="monotone"
              dataKey="revenue"
              stroke={strokeColor}
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#monochromeRevenueGradient)"
              activeDot={{
                r: 5,
                fill: strokeColor,
                stroke: isDark ? '#09090b' : '#ffffff',
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  )
}
