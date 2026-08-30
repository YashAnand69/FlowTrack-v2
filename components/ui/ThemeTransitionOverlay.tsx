'use client'

import React from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { Moon, Sun, Sparkles } from 'lucide-react'
import { useTheme } from '@/lib/context/ThemeContext'

export function ThemeTransitionOverlay() {
  const { transitionState } = useTheme()
  const shouldReduceMotion = useReducedMotion()

  const { isTransitioning, targetTheme, originX, originY } = transitionState
  const isTargetDark = targetTheme === 'dark'

  if (shouldReduceMotion) return null

  return (
    <AnimatePresence>
      {isTransitioning && targetTheme && (
        <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
          {/* Expanding Radial Liquid Aperture Veil */}
          <motion.div
            initial={{
              clipPath: `circle(0px at ${originX}px ${originY}px)`,
              opacity: 0.95,
            }}
            animate={{
              clipPath: `circle(160vmax at ${originX}px ${originY}px)`,
              opacity: [0.95, 1, 0],
            }}
            exit={{
              opacity: 0,
            }}
            transition={{
              duration: 0.65,
              ease: [0.22, 1, 0.36, 1], // Apple/Lusion quintic ease-out
            }}
            className={`fixed inset-0 backdrop-blur-3xl ${
              isTargetDark
                ? 'bg-[#09090b]/90 text-white'
                : 'bg-[#fbfbfb]/90 text-zinc-950'
            }`}
          />

          {/* Centered Minimalist Theme Shutter Emblem */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
            transition={{
              duration: 0.35,
              ease: 'easeOut',
            }}
            className="fixed inset-0 flex items-center justify-center p-4 z-[101]"
          >
            <div
              className={`flex items-center gap-3.5 px-5 py-3 rounded-2xl border shadow-2xl backdrop-blur-2xl ${
                isTargetDark
                  ? 'bg-white/10 border-white/20 text-white shadow-[0_0_40px_rgba(255,255,255,0.15)]'
                  : 'bg-black/5 border-black/10 text-zinc-950 shadow-[0_0_40px_rgba(0,0,0,0.08)]'
              }`}
            >
              <motion.div
                animate={{ rotate: isTargetDark ? [0, -45, 0] : [0, 90, 0] }}
                transition={{ duration: 0.6, ease: 'easeInOut' }}
                className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold ${
                  isTargetDark
                    ? 'bg-white text-zinc-950 shadow-md'
                    : 'bg-zinc-950 text-white shadow-md'
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
                  className={`text-[10px] font-mono ${
                    isTargetDark ? 'text-zinc-400' : 'text-zinc-500'
                  }`}
                >
                  {isTargetDark ? 'Deep Charcoal #09090b' : 'Pure Frosted Glass #ffffff'}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
