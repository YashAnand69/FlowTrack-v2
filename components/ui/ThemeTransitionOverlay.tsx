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
        <div
          key={targetTheme}
          className="fixed inset-0 pointer-events-none z-[100] flex items-center justify-center overflow-hidden"
        >
          {/* 1. Fullscreen Fluid Veil (Smooth 60fps Base Atmosphere) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.92, 0.92, 0] }}
            transition={{
              duration: 0.82,
              times: [0, 0.28, 0.68, 1],
              ease: [0.16, 1, 0.3, 1],
            }}
            className={`fixed inset-0 backdrop-blur-2xl ${
              isTargetDark
                ? 'bg-[#09090b]/85 shadow-[inset_0_0_150px_rgba(255,255,255,0.04)]'
                : 'bg-[#fbfbfb]/85 shadow-[inset_0_0_150px_rgba(0,0,0,0.04)]'
            }`}
          />

          {/* 2. Concentric Liquid Shockwave Ripples (Lusion Fluid Wave Effect) */}
          {[0, 1, 2].map((ringIdx) => (
            <motion.div
              key={`ring-${ringIdx}`}
              initial={{ scale: 0.1, opacity: 0 }}
              animate={{
                scale: [0.1, 1.2 + ringIdx * 0.6, 2.4 + ringIdx * 0.8],
                opacity: [0, 0.6 - ringIdx * 0.15, 0],
              }}
              transition={{
                duration: 0.85,
                delay: ringIdx * 0.08,
                ease: [0.22, 1, 0.36, 1],
              }}
              className={`absolute rounded-full border border-dashed pointer-events-none ${
                isTargetDark
                  ? 'w-[450px] h-[450px] border-white/20 shadow-[0_0_50px_rgba(255,255,255,0.12)]'
                  : 'w-[450px] h-[450px] border-zinc-900/15 shadow-[0_0_50px_rgba(0,0,0,0.08)]'
              }`}
            />
          ))}

          {/* 3. Expanding Luminous Volumetric Plasma Orb */}
          <motion.div
            initial={{ scale: 0.2, opacity: 0 }}
            animate={{
              scale: [0.2, 1.4, 2.2],
              opacity: [0, 0.75, 0],
            }}
            transition={{
              duration: 0.8,
              ease: [0.16, 1, 0.3, 1],
            }}
            className={`absolute w-[500px] h-[500px] rounded-full blur-[90px] pointer-events-none ${
              isTargetDark
                ? 'bg-gradient-to-tr from-white/20 via-zinc-400/15 to-transparent'
                : 'bg-gradient-to-tr from-zinc-950/20 via-zinc-600/15 to-transparent'
            }`}
          />

          {/* 4. Center Glassmorphic Morph Capsule & Floating Hologram */}
          <motion.div
            initial={{ opacity: 0, scale: 0.75, y: 30, rotateX: 25 }}
            animate={{
              opacity: [0, 1, 1, 0],
              scale: [0.75, 1.04, 1, 0.95],
              y: [30, -4, 0, -20],
              rotateX: [25, 0, 0, -10],
            }}
            transition={{
              duration: 0.8,
              times: [0, 0.32, 0.72, 1],
              ease: [0.16, 1, 0.3, 1],
            }}
            style={{ perspective: 1000 }}
            className={`relative z-10 flex items-center gap-4 px-6 py-3.5 rounded-3xl border shadow-2xl backdrop-blur-3xl ${
              isTargetDark
                ? 'bg-[#121216]/95 border-white/20 text-white shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.2)]'
                : 'bg-white/95 border-zinc-300/80 text-zinc-950 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.9)]'
            }`}
          >
            {/* Magnetic Orb Icon Container with 360 Spin & Pulsing Glow */}
            <motion.div
              animate={{
                rotate: isTargetDark ? [0, 360] : [0, -360],
                scale: [0.9, 1.15, 1],
              }}
              transition={{
                duration: 0.75,
                ease: [0.16, 1, 0.3, 1],
              }}
              className={`relative w-10 h-10 rounded-2xl flex items-center justify-center font-bold shadow-lg ${
                isTargetDark
                  ? 'bg-white text-zinc-950 shadow-[0_0_30px_rgba(255,255,255,0.5)]'
                  : 'bg-zinc-950 text-white shadow-[0_0_30px_rgba(0,0,0,0.3)]'
              }`}
            >
              {isTargetDark ? (
                <Moon className="w-5 h-5 fill-current" />
              ) : (
                <Sun className="w-5 h-5 fill-current" />
              )}

              {/* Orbiting Sparkle */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                className="absolute -top-1 -right-1"
              >
                <Sparkles
                  className={`w-3.5 h-3.5 ${
                    isTargetDark ? 'text-zinc-900' : 'text-zinc-100'
                  }`}
                />
              </motion.div>
            </motion.div>

            {/* Typography & Subtitle */}
            <div className="flex flex-col pr-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-black uppercase tracking-wider">
                  {isTargetDark ? 'Dark Canvas' : 'Light Canvas'}
                </span>
                <span
                  className={`text-[9px] font-mono px-1.5 py-0.5 rounded-full uppercase tracking-widest ${
                    isTargetDark
                      ? 'bg-white/10 text-white/80 border border-white/10'
                      : 'bg-zinc-100 text-zinc-800 border border-zinc-200'
                  }`}
                >
                  Fluid Mode
                </span>
              </div>
              <span
                className={`text-[11px] font-mono tracking-tight mt-0.5 ${
                  isTargetDark ? 'text-zinc-400' : 'text-zinc-500'
                }`}
              >
                {isTargetDark ? 'Deep Charcoal #09090b' : 'Pure Frosted Glass #ffffff'}
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
