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
        <motion.div
          key={targetTheme}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: 0.28,
            ease: [0.16, 1, 0.3, 1], // Buttery smooth cubic curve
          }}
          className="fixed inset-0 pointer-events-none z-[100] flex items-center justify-center overflow-hidden"
        >
          {/* Fullscreen Velvet Frosted Curtain */}
          <motion.div
            initial={{ opacity: 0, scale: 1.01 }}
            animate={{ opacity: [0, 0.96, 0.96, 0], scale: [1.01, 1, 1, 0.99] }}
            transition={{
              duration: 0.68,
              times: [0, 0.25, 0.65, 1],
              ease: 'easeInOut',
            }}
            className={`fixed inset-0 backdrop-blur-2xl transition-colors duration-300 ${
              isTargetDark
                ? 'bg-[#09090b]/90 shadow-[inset_0_0_120px_rgba(255,255,255,0.03)]'
                : 'bg-[#fbfbfb]/90 shadow-[inset_0_0_120px_rgba(0,0,0,0.03)]'
            }`}
          />

          {/* Atmospheric Ambient Glow Aura */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: [0, 0.6, 0], scale: [0.8, 1.2, 1.4] }}
            transition={{ duration: 0.65, ease: 'easeOut' }}
            className={`absolute w-[400px] h-[400px] rounded-full blur-[100px] ${
              isTargetDark ? 'bg-white/10' : 'bg-zinc-950/10'
            }`}
          />

          {/* Centered Floating Capsule Badge */}
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.92 }}
            animate={{ opacity: [0, 1, 1, 0], y: [12, 0, 0, -8], scale: [0.92, 1, 1, 0.96] }}
            transition={{
              duration: 0.65,
              times: [0, 0.25, 0.7, 1],
              ease: [0.16, 1, 0.3, 1],
            }}
            className={`relative z-10 flex items-center gap-3.5 px-5 py-3 rounded-2xl border shadow-2xl backdrop-blur-3xl ${
              isTargetDark
                ? 'bg-[#141418]/90 border-white/[0.12] text-white shadow-[0_16px_40px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.12)]'
                : 'bg-white/90 border-zinc-200/80 text-zinc-950 shadow-[0_16px_40px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.9)]'
            }`}
          >
            {/* Morphing Rotating Glyph */}
            <motion.div
              animate={{ rotate: isTargetDark ? [-20, 0] : [20, 0] }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
              className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold shadow-xs ${
                isTargetDark
                  ? 'bg-white text-zinc-950 shadow-[0_0_20px_rgba(255,255,255,0.4)]'
                  : 'bg-zinc-950 text-white shadow-[0_0_20px_rgba(0,0,0,0.2)]'
              }`}
            >
              {isTargetDark ? (
                <Moon className="w-4 h-4 fill-current" />
              ) : (
                <Sun className="w-4 h-4 fill-current" />
              )}
            </motion.div>

            <div className="flex flex-col">
              <span className="text-xs font-mono font-bold uppercase tracking-wider">
                {isTargetDark ? 'Dark Canvas' : 'Light Canvas'}
              </span>
              <span
                className={`text-[10px] font-mono tracking-tight ${
                  isTargetDark ? 'text-zinc-400' : 'text-zinc-500'
                }`}
              >
                {isTargetDark ? 'Deep Charcoal #09090b' : 'Pure Frosted Glass #ffffff'}
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
