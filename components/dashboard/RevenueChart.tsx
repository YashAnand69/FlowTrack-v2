'use client'

import React, { useState } from 'react'
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
import { LiquidCard } from '@/components/ui/LiquidCard'
import { soundEngine } from '@/lib/utils/haptics'

interface RevenueChartProps {
  data: Array<{
    month: string
    year: number
    revenue: number
  }>
}

type Timeframe = '6M' | 'YTD' | '1Y'

export function RevenueChart({ data }: RevenueChartProps) {
  const { profile } = useAuth()
  const { theme } = useTheme()
  const shouldReduceMotion = useReducedMotion()
  const [timeframe, setTimeframe] = useState<Timeframe>('6M')

  const currency = profile?.currency || 'USD'
  const isDark = theme === 'dark'

  // Timeframe calculation filter
  const displayedData = React.useMemo(() => {
    if (timeframe === '6M') {
      return data.slice(-6)
    } else if (timeframe === 'YTD') {
      const currentYear = new Date().getFullYear()
      const ytd = data.filter((d) => d.year === currentYear)
      return ytd.length > 0 ? ytd : data.slice(-4)
    } else {
      // 1Y or all points
      return data
    }
  }, [data, timeframe])

  const totalPeriodRevenue = displayedData.reduce((sum, d) => sum + d.revenue, 0)
  const averageMonthly = Math.round(totalPeriodRevenue / (displayedData.length || 1))

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-zinc-950/95 dark:bg-[#151518]/95 text-white p-3 rounded-xl shadow-2xl border border-white/10 text-xs backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
          <p className="font-mono text-zinc-400 text-[10px] uppercase tracking-wider">{label}</p>
          <p className="text-sm font-mono font-bold text-white mt-1">
            {formatCurrency(payload[0].value, currency)}
          </p>
          <p className="text-[10px] text-zinc-400 mt-0.5">Settled Revenue</p>
        </div>
      )
    }
    return null
  }

  const strokeColor = isDark ? '#ffffff' : '#09090b'

  const timeframes: Array<{ key: Timeframe; label: string }> = [
    { key: '6M', label: '6 Months' },
    { key: 'YTD', label: 'Year to Date' },
    { key: '1Y', label: '1 Year' },
  ]

  return (
    <motion.div
      initial={shouldReduceMotion ? {} : { opacity: 0, y: 16 }}
      animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
      transition={{ delay: 0.2, type: 'spring', stiffness: 300, damping: 25 }}
      className="w-full"
    >
      <LiquidCard className="p-6" tiltStrength={4} glareOpacity={0.08}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-sm font-bold uppercase tracking-wider font-mono text-zinc-950 dark:text-white">
                Revenue Velocity
              </h2>
              <span className="text-xs font-mono font-semibold text-zinc-400 dark:text-zinc-500">
                Avg {formatCurrency(averageMonthly, currency)}/mo
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5 font-normal">
              Rolling settlement cashflow & growth trajectory
            </p>
          </div>

          {/* Timeframe Filter Pills with Layout Morphing */}
          <div className="flex items-center gap-1 p-1 bg-black/[0.04] dark:bg-white/[0.06] rounded-xl border border-black/5 dark:border-white/10 self-start sm:self-auto">
            {timeframes.map((tf) => {
              const isSelected = timeframe === tf.key
              return (
                <button
                  key={tf.key}
                  onClick={() => {
                    soundEngine.playClick()
                    setTimeframe(tf.key)
                  }}
                  className={`relative px-3 py-1 text-xs font-mono font-bold rounded-lg transition-colors cursor-pointer ${
                    isSelected
                      ? 'text-zinc-950 dark:text-white'
                      : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
                  }`}
                >
                  {isSelected && (
                    <motion.div
                      layoutId="activeChartTimeframe"
                      transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                      className="absolute inset-0 bg-white dark:bg-[#1a1a1f] rounded-lg shadow-xs border border-black/5 dark:border-white/10"
                    />
                  )}
                  <span className="relative z-10">{tf.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={displayedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="monochromeRevenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={strokeColor} stopOpacity={isDark ? 0.25 : 0.15} />
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
                strokeWidth={2.2}
                fillOpacity={1}
                fill="url(#monochromeRevenueGradient)"
                activeDot={{
                  r: 6,
                  fill: strokeColor,
                  stroke: isDark ? '#09090b' : '#ffffff',
                  strokeWidth: 2.5,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </LiquidCard>
    </motion.div>
  )
}
