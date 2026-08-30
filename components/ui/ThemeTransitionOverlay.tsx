'use client'

import React, { useEffect, useRef } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { Moon, Sun, Sparkles, Zap } from 'lucide-react'
import { useTheme } from '@/lib/context/ThemeContext'
import { soundEngine } from '@/lib/utils/haptics'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  alpha: number
  color: string
  angle: number
  distance: number
  speed: number
  orbitRadius: number
}

export function ThemeTransitionOverlay() {
  const { transitionState } = useTheme()
  const shouldReduceMotion = useReducedMotion()
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  const { isTransitioning, targetTheme } = transitionState
  const isTargetDark = targetTheme === 'dark'

  useEffect(() => {
    if (!isTransitioning || shouldReduceMotion) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    let animId: number
    const width = (canvas.width = window.innerWidth * (window.devicePixelRatio || 1))
    const height = (canvas.height = window.innerHeight * (window.devicePixelRatio || 1))
    const cx = width / 2
    const cy = height / 2

    // Spawn 140 fluid vortex particles
    const particleCount = 140
    const particles: Particle[] = []
    const baseColor = isTargetDark ? '255, 255, 255' : '10, 10, 15'

    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2
      const dist = 100 + Math.random() * Math.min(width, height) * 0.45
      particles.push({
        x: cx + Math.cos(angle) * dist,
        y: cy + Math.sin(angle) * dist,
        vx: 0,
        vy: 0,
        radius: 1.5 + Math.random() * 3.5,
        alpha: 0.2 + Math.random() * 0.8,
        color: baseColor,
        angle,
        distance: dist,
        speed: 0.03 + Math.random() * 0.05,
        orbitRadius: dist,
      })
    }

    let progress = 0
    const startTime = performance.now()
    const totalDuration = 880 // ms

    const render = (now: number) => {
      const elapsed = now - startTime
      progress = Math.min(elapsed / totalDuration, 1)

      ctx.clearRect(0, 0, width, height)

      // Phase 1: Vortex Gravitational Implosion (0 -> 0.4)
      // Phase 2: Supernova Detonation & Shockwave (0.4 -> 1.0)
      const isExploding = progress > 0.38

      ctx.save()

      // 1. Draw Rotating Chromatic Rays / Volumetric Light Beams
      const rayCount = 12
      const rayAngleOffset = progress * 4.5
      const rayAlpha = progress < 0.4 ? progress * 1.8 : (1 - progress) * 1.2

      for (let r = 0; r < rayCount; r++) {
        const rAngle = rayAngleOffset + (r * Math.PI * 2) / rayCount
        const rayLength = Math.max(width, height) * (0.4 + progress * 0.8)
        const rx = cx + Math.cos(rAngle) * rayLength
        const ry = cy + Math.sin(rAngle) * rayLength

        const grad = ctx.createRadialGradient(cx, cy, 10, rx, ry, rayLength)
        grad.addColorStop(0, `rgba(${baseColor}, ${rayAlpha * 0.35})`)
        grad.addColorStop(0.5, `rgba(${baseColor}, ${rayAlpha * 0.08})`)
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)')

        ctx.beginPath()
        ctx.moveTo(cx, cy)
        ctx.arc(cx, cy, rayLength, rAngle - 0.12, rAngle + 0.12)
        ctx.closePath()
        ctx.fillStyle = grad
        ctx.fill()
      }

      // 2. Liquid Chrome Eclipse Ring / Shockwave Core
      let coreRadius: number
      let coreAlpha: number

      if (!isExploding) {
        // Gravitational contraction into core
        const easeIn = Math.pow(progress / 0.38, 2)
        coreRadius = (1 - easeIn * 0.7) * 70 * (window.devicePixelRatio || 1)
        coreAlpha = progress * 2.2
      } else {
        // Detonation Shockwave expansion
        const explodeProgress = (progress - 0.38) / 0.62
        const easeOut = 1 - Math.pow(1 - explodeProgress, 3)
        coreRadius = 20 + easeOut * Math.max(width, height) * 1.2
        coreAlpha = (1 - explodeProgress) * 0.95
      }

      // Glowing liquid aura around core
      const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(coreRadius * 1.5, 10))
      coreGrad.addColorStop(0, `rgba(${baseColor}, ${coreAlpha * 0.85})`)
      coreGrad.addColorStop(0.3, `rgba(${baseColor}, ${coreAlpha * 0.4})`)
      coreGrad.addColorStop(0.8, `rgba(${baseColor}, ${coreAlpha * 0.1})`)
      coreGrad.addColorStop(1, 'rgba(0,0,0,0)')

      ctx.beginPath()
      ctx.arc(cx, cy, Math.max(coreRadius * 1.5, 10), 0, Math.PI * 2)
      ctx.fillStyle = coreGrad
      ctx.fill()

      // Sharp Eclipse Ring with Chromatic Glow
      ctx.beginPath()
      ctx.arc(cx, cy, Math.max(coreRadius, 5), 0, Math.PI * 2)
      ctx.lineWidth = (3 + (1 - progress) * 6) * (window.devicePixelRatio || 1)
      ctx.strokeStyle = `rgba(${baseColor}, ${coreAlpha})`
      ctx.shadowColor = isTargetDark ? '#ffffff' : '#000000'
      ctx.shadowBlur = 30 * (window.devicePixelRatio || 1)
      ctx.stroke()
      ctx.shadowBlur = 0

      // 3. Fluid Dynamic Swirling Particles
      particles.forEach((p) => {
        if (!isExploding) {
          // Vortex Spiral towards center
          p.angle += p.speed
          p.distance *= 0.94 // Sucked in
          p.x = cx + Math.cos(p.angle) * p.distance
          p.y = cy + Math.sin(p.angle) * p.distance
        } else {
          // Explode outward with high-velocity shockwave
          if (p.vx === 0 && p.vy === 0) {
            const burstAngle = p.angle + (Math.random() - 0.5) * 0.5
            const burstSpeed = 8 + Math.random() * 26
            p.vx = Math.cos(burstAngle) * burstSpeed * (window.devicePixelRatio || 1)
            p.vy = Math.sin(burstAngle) * burstSpeed * (window.devicePixelRatio || 1)
          }
          p.x += p.vx
          p.y += p.vy
          p.vx *= 0.94 // Fluid air resistance
          p.vy *= 0.94
        }

        const particleAlpha = (1 - progress) * p.alpha
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius * (window.devicePixelRatio || 1), 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${p.color}, ${particleAlpha})`
        ctx.fill()
      })

      ctx.restore()

      if (progress < 1) {
        animId = requestAnimationFrame(render)
      }
    }

    animId = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(animId)
    }
  }, [isTransitioning, isTargetDark, shouldReduceMotion])

  if (shouldReduceMotion) return null

  return (
    <AnimatePresence mode="wait">
      {isTransitioning && targetTheme && (
        <div
          key={targetTheme}
          className="fixed inset-0 pointer-events-none z-[100] flex items-center justify-center overflow-hidden"
        >
          {/* Fullscreen Base Glass Atmosphere Veil */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.94, 0.94, 0] }}
            transition={{
              duration: 0.88,
              times: [0, 0.32, 0.72, 1],
              ease: [0.16, 1, 0.3, 1],
            }}
            className={`fixed inset-0 backdrop-blur-2xl ${
              isTargetDark
                ? 'bg-[#09090b]/88 shadow-[inset_0_0_200px_rgba(255,255,255,0.06)]'
                : 'bg-[#fbfbfb]/88 shadow-[inset_0_0_200px_rgba(0,0,0,0.06)]'
            }`}
          />

          {/* High-Performance Fluid Vortex Canvas Animation */}
          <canvas
            ref={canvasRef}
            className="fixed inset-0 w-full h-full pointer-events-none z-[101]"
          />

          {/* Futuristic Floating HUD Emblem Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.7, y: 35, rotateX: 30 }}
            animate={{
              opacity: [0, 1, 1, 0],
              scale: [0.7, 1.05, 1, 0.92],
              y: [35, -5, 0, -25],
              rotateX: [30, 0, 0, -15],
            }}
            transition={{
              duration: 0.86,
              times: [0, 0.35, 0.72, 1],
              ease: [0.16, 1, 0.3, 1],
            }}
            style={{ perspective: 1200 }}
            className={`relative z-[102] flex items-center gap-4 px-6 py-3.5 rounded-3xl border shadow-2xl backdrop-blur-3xl ${
              isTargetDark
                ? 'bg-[#121216]/95 border-white/25 text-white shadow-[0_30px_70px_-15px_rgba(0,0,0,0.9),0_0_50px_rgba(255,255,255,0.15)]'
                : 'bg-white/95 border-zinc-400/80 text-zinc-950 shadow-[0_30px_70px_-15px_rgba(0,0,0,0.15),0_0_50px_rgba(0,0,0,0.08)]'
            }`}
          >
            {/* Magnetic Orb Icon Container with Dual Spin & Particle Burst */}
            <motion.div
              animate={{
                rotate: isTargetDark ? [0, 360] : [0, -360],
                scale: [0.85, 1.2, 1],
              }}
              transition={{
                duration: 0.8,
                ease: [0.16, 1, 0.3, 1],
              }}
              className={`relative w-11 h-11 rounded-2xl flex items-center justify-center font-bold shadow-xl ${
                isTargetDark
                  ? 'bg-white text-zinc-950 shadow-[0_0_35px_rgba(255,255,255,0.7)]'
                  : 'bg-zinc-950 text-white shadow-[0_0_35px_rgba(0,0,0,0.4)]'
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
                <Zap
                  className={`w-3.5 h-3.5 fill-current ${
                    isTargetDark ? 'text-zinc-900' : 'text-zinc-100'
                  }`}
                />
              </motion.div>
            </motion.div>

            {/* Typography & Subtitle */}
            <div className="flex flex-col pr-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-black uppercase tracking-widest">
                  {isTargetDark ? 'DARK CANVAS' : 'LIGHT CANVAS'}
                </span>
                <span
                  className={`text-[9px] font-mono px-2 py-0.5 rounded-full uppercase tracking-widest font-bold ${
                    isTargetDark
                      ? 'bg-white/15 text-white border border-white/20'
                      : 'bg-zinc-950/10 text-zinc-950 border border-zinc-950/15'
                  }`}
                >
                  QUANTUM MORPH
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
