'use client'

import React from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { Moon, Sun, Sparkles } from 'lucide-react'
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
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 pointer-events-none z-[100] flex items-center justify-center overflow-hidden"
        >
          {/* 1. Fullscreen Meditative Atmospheric Mist */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.96, 0.96, 0] }}
            transition={{
              duration: 1.65,
              times: [0, 0.3, 0.72, 1],
              ease: [0.16, 1, 0.3, 1],
            }}
            className={`fixed inset-0 backdrop-blur-3xl transition-colors duration-700 ${
              isTargetDark
                ? 'bg-[#09090b]/92 shadow-[inset_0_0_180px_rgba(255,255,255,0.03)]'
                : 'bg-[#fbfbfb]/92 shadow-[inset_0_0_180px_rgba(0,0,0,0.03)]'
            }`}
          />

          {/* 2. Slow Breathing Volumetric Light Bloom */}
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{
              scale: [0.6, 1.25, 1.4, 1.8],
              opacity: [0, 0.5, 0.5, 0],
            }}
            transition={{
              duration: 1.65,
              times: [0, 0.35, 0.7, 1],
              ease: 'easeInOut',
            }}
            className={`absolute w-[550px] h-[550px] rounded-full blur-[100px] pointer-events-none ${
              isTargetDark
                ? 'bg-gradient-to-tr from-white/15 via-zinc-400/10 to-transparent'
                : 'bg-gradient-to-tr from-zinc-950/15 via-zinc-500/10 to-transparent'
            }`}
          />

          {/* 3. Slow Concentric Ambient Liquid Halos */}
          <motion.div
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{
              scale: [0.3, 1.1, 2.2],
              opacity: [0, 0.35, 0],
            }}
            transition={{
              duration: 1.6,
              times: [0, 0.4, 1],
              ease: [0.16, 1, 0.3, 1],
            }}
            className={`absolute w-[400px] h-[400px] rounded-full border pointer-events-none ${
              isTargetDark
                ? 'border-white/15 shadow-[0_0_60px_rgba(255,255,255,0.08)]'
                : 'border-zinc-950/12 shadow-[0_0_60px_rgba(0,0,0,0.05)]'
            }`}
          />

          {/* 4. Elegant Minimalist Center Stage Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.88, y: 20 }}
            animate={{
              opacity: [0, 1, 1, 0],
              scale: [0.88, 1, 1, 0.96],
              y: [20, 0, 0, -12],
            }}
            transition={{
              duration: 1.6,
              times: [0, 0.32, 0.75, 1],
              ease: [0.16, 1, 0.3, 1],
            }}
            className={`relative z-10 flex flex-col items-center gap-4 px-8 py-6 rounded-3xl border shadow-2xl backdrop-blur-3xl text-center max-w-sm w-full mx-4 ${
              isTargetDark
                ? 'bg-[#121216]/90 border-white/[0.12] text-white shadow-[0_30px_70px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.12)]'
                : 'bg-white/90 border-zinc-200 text-zinc-950 shadow-[0_30px_70px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.9)]'
            }`}
          >
            {/* Lusion-style Organic Liquid Orb Icon Container */}
            <motion.div
              animate={{
                rotate: isTargetDark ? [0, 180] : [0, -180],
                scale: [0.95, 1.08, 1],
              }}
              transition={{
                duration: 1.5,
                ease: [0.16, 1, 0.3, 1],
              }}
              className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold shadow-lg ${
                isTargetDark
                  ? 'bg-white text-zinc-950 shadow-[0_0_30px_rgba(255,255,255,0.35)]'
                  : 'bg-zinc-950 text-white shadow-[0_0_30px_rgba(0,0,0,0.2)]'
              }`}
            >
              {isTargetDark ? (
                <Moon className="w-6 h-6 fill-current" />
              ) : (
                <Sun className="w-6 h-6 fill-current" />
              )}
            </motion.div>

            {/* Typography */}
            <div className="space-y-1">
              <motion.p
                initial={{ letterSpacing: '0.15em', opacity: 0 }}
                animate={{ letterSpacing: '0.25em', opacity: 1 }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
                className="text-xs font-mono font-black uppercase"
              >
                {isTargetDark ? 'ENTERING DARK CANVAS' : 'ENTERING LIGHT CANVAS'}
              </motion.p>
              <p
                className={`text-[10px] font-mono tracking-wider uppercase ${
                  isTargetDark ? 'text-zinc-400' : 'text-zinc-500'
                }`}
              >
                {isTargetDark ? 'Deep Charcoal Optics // #09090B' : 'Frosted Glass Optics // #FBFBFB'}
              </p>
            </div>

            {/* Delicate Glowing Hairline Progress Filament */}
            <div className="w-full h-[2px] bg-black/[0.06] dark:bg-white/[0.08] rounded-full overflow-hidden mt-1">
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{
                  duration: 1.35,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className={`h-full rounded-full ${
                  isTargetDark
                    ? 'bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]'
                    : 'bg-zinc-950 shadow-[0_0_10px_rgba(0,0,0,0.5)]'
                }`}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
