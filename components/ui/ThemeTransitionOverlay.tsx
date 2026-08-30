'use client'

import React from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/lib/context/ThemeContext'

export function ThemeTransitionOverlay() {
  const { transitionState } = useTheme()
  const shouldReduceMotion = useReducedMotion()

  const { isTransitioning, targetTheme } = transitionState
  const isTargetDark = targetTheme === 'dark'

  if (shouldReduceMotion) return null

  return (
    <AnimatePresence mode="wait">
      {isTransitioning && targetTheme && (
        <div
          key={targetTheme}
          className="fixed inset-0 pointer-events-none z-[100] flex items-center justify-center overflow-hidden"
        >
          {/* 1. Calm Ambient Glass Atmosphere */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.94, 0.94, 0] }}
            transition={{
              duration: 0.65,
              times: [0, 0.3, 0.7, 1],
              ease: [0.16, 1, 0.3, 1],
            }}
            className={`fixed inset-0 backdrop-blur-2xl ${
              isTargetDark
                ? 'bg-[#09090b]/85'
                : 'bg-[#fbfbfb]/85'
            }`}
          />

          {/* 2. Minimalist Liquid Mercury Drop & Expanding Soft Ripple Wave */}
          <motion.div
            initial={{ scale: 0.2, opacity: 0 }}
            animate={{
              scale: [0.2, 1, 2.5],
              opacity: [0, 0.5, 0],
            }}
            transition={{
              duration: 0.65,
              ease: [0.16, 1, 0.3, 1],
            }}
            className={`absolute w-[450px] h-[450px] rounded-full border ${
              isTargetDark
                ? 'border-white/25 shadow-[0_0_80px_rgba(255,255,255,0.15)]'
                : 'border-zinc-950/20 shadow-[0_0_80px_rgba(0,0,0,0.08)]'
            }`}
          />

          {/* 3. Soft Ethereal Caustic Halo */}
          <motion.div
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{
              scale: [0.4, 1.2, 1.6],
              opacity: [0, 0.4, 0],
            }}
            transition={{
              duration: 0.65,
              ease: 'easeOut',
            }}
            className={`absolute w-[350px] h-[350px] rounded-full blur-[70px] ${
              isTargetDark ? 'bg-white/10' : 'bg-zinc-950/10'
            }`}
          />

          {/* 4. Understated Minimalist Floating Pill */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 15 }}
            animate={{
              opacity: [0, 1, 1, 0],
              scale: [0.9, 1, 1, 0.95],
              y: [15, 0, 0, -10],
            }}
            transition={{
              duration: 0.62,
              times: [0, 0.3, 0.7, 1],
              ease: [0.16, 1, 0.3, 1],
            }}
            className={`relative z-10 flex items-center gap-3 px-4.5 py-2.5 rounded-2xl border shadow-xl backdrop-blur-2xl ${
              isTargetDark
                ? 'bg-[#121215]/95 border-white/[0.12] text-white shadow-[0_20px_50px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.1)]'
                : 'bg-white/95 border-zinc-200 text-zinc-950 shadow-[0_20px_50px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.8)]'
            }`}
          >
            {/* Subtle Rotating Icon */}
            <motion.div
              animate={{ rotate: isTargetDark ? [-25, 0] : [25, 0] }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
              className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold ${
                isTargetDark
                  ? 'bg-white text-zinc-950 shadow-xs'
                  : 'bg-zinc-950 text-white shadow-xs'
              }`}
            >
              {isTargetDark ? (
                <Moon className="w-3.5 h-3.5 fill-current" />
              ) : (
                <Sun className="w-3.5 h-3.5 fill-current" />
              )}
            </motion.div>

            {/* Typography */}
            <div className="flex flex-col pr-1">
              <span className="text-[11px] font-mono font-bold tracking-tight uppercase">
                {isTargetDark ? 'Dark Canvas' : 'Light Canvas'}
              </span>
              <span
                className={`text-[9px] font-mono ${
                  isTargetDark ? 'text-zinc-400' : 'text-zinc-500'
                }`}
              >
                {isTargetDark ? '#09090b charcoal' : '#fbfbfb frosted'}
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
