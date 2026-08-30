'use client'

import React, { useEffect, useRef } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { useTheme } from '@/lib/context/ThemeContext'

interface PaintDroplet {
  angle: number
  distance: number
  radius: number
  speed: number
  offset: number
}

export function ThemeTransitionOverlay() {
  const { transitionState } = useTheme()
  const shouldReduceMotion = useReducedMotion()
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  const { isTransitioning, targetTheme, originX, originY } = transitionState
  const isTargetDark = targetTheme === 'dark'

  useEffect(() => {
    if (!isTransitioning || shouldReduceMotion) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    let animId: number
    const dpr = window.devicePixelRatio || 1
    const width = (canvas.width = window.innerWidth * dpr)
    const height = (canvas.height = window.innerHeight * dpr)

    const ox = originX * dpr
    const oy = originY * dpr

    // Maximum distance from origin to farthest viewport corner
    const maxDist = Math.hypot(
      Math.max(ox, width - ox),
      Math.max(oy, height - oy)
    ) * 1.25

    // Paint rays for organic liquid spline wave front
    const numRays = 80
    const rayNoise: number[] = []
    const raySpeeds: number[] = []
    for (let i = 0; i < numRays; i++) {
      rayNoise.push(0.7 + Math.random() * 0.6)
      raySpeeds.push(0.85 + Math.random() * 0.3)
    }

    // Paint splatter droplets ahead of the wave
    const droplets: PaintDroplet[] = []
    for (let i = 0; i < 40; i++) {
      droplets.push({
        angle: Math.random() * Math.PI * 2,
        distance: Math.random() * 0.9,
        radius: (3 + Math.random() * 7) * dpr,
        speed: 1.1 + Math.random() * 0.5,
        offset: Math.random() * 50 * dpr,
      })
    }

    const paintColor = isTargetDark ? '#09090b' : '#fbfbfb'
    const paintGlossColor = isTargetDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'
    const startTime = performance.now()
    const floodDuration = 620 // ms to reach 100% coverage
    const totalDuration = 1400 // ms total transition

    const render = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / totalDuration, 1)

      ctx.clearRect(0, 0, width, height)

      // Phase 1: Flood expanding ($0 \rightarrow 0.62$)
      // Phase 2: Paint settling and fading ($0.62 \rightarrow 1.0$)
      const floodProgress = Math.min(elapsed / floodDuration, 1)
      // Ease in-out cubic for realistic fluid acceleration
      const floodEase =
        floodProgress < 0.5
          ? 4 * floodProgress * floodProgress * floodProgress
          : 1 - Math.pow(-2 * floodProgress + 2, 3) / 2

      const baseRadius = floodEase * maxDist

      ctx.save()

      // Dissolve out when settling
      if (progress > 0.55) {
        const fadeOut = 1 - (progress - 0.55) / 0.45
        ctx.globalAlpha = Math.max(0, fadeOut)
      }

      // 1. Draw Viscous Splatter Droplets
      if (floodProgress < 0.95) {
        ctx.fillStyle = paintColor
        droplets.forEach((drop) => {
          const dropDist = baseRadius * drop.speed + drop.offset
          const dx = ox + Math.cos(drop.angle) * dropDist
          const dy = oy + Math.sin(drop.angle) * dropDist

          ctx.beginPath()
          ctx.arc(dx, dy, drop.radius * (1 - floodProgress * 0.5), 0, Math.PI * 2)
          ctx.fill()
        })
      }

      // 2. Draw Organic Liquid Paint Spline Wave
      ctx.beginPath()
      const points: { x: number; y: number }[] = []

      for (let i = 0; i < numRays; i++) {
        const angle = (i * Math.PI * 2) / numRays
        // Dynamic undulating organic fluid wave
        const waveOsc = Math.sin(angle * 6 + elapsed * 0.006) * 20 * dpr
        const r = Math.max(5, baseRadius * rayNoise[i] * raySpeeds[i] + waveOsc)

        const px = ox + Math.cos(angle) * r
        const py = oy + Math.sin(angle) * r
        points.push({ x: px, y: py })
      }

      // Smooth closed curve through points
      ctx.moveTo(points[0].x, points[0].y)
      for (let i = 0; i < points.length; i++) {
        const p1 = points[i]
        const p2 = points[(i + 1) % points.length]
        const midX = (p1.x + p2.x) / 2
        const midY = (p1.y + p2.y) / 2
        ctx.quadraticCurveTo(p1.x, p1.y, midX, midY)
      }
      ctx.closePath()

      // Solid Paint Fill
      ctx.fillStyle = paintColor
      ctx.shadowColor = isTargetDark ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.25)'
      ctx.shadowBlur = 40 * dpr
      ctx.fill()
      ctx.shadowBlur = 0

      // 3. Liquid Viscous Paint Edge Specular Gloss
      if (floodProgress < 0.9) {
        ctx.strokeStyle = paintGlossColor
        ctx.lineWidth = 8 * dpr
        ctx.stroke()
      }

      ctx.restore()

      if (progress < 1) {
        animId = requestAnimationFrame(render)
      }
    }

    animId = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(animId)
    }
  }, [isTransitioning, isTargetDark, originX, originY, shouldReduceMotion])

  if (shouldReduceMotion) return null

  return (
    <AnimatePresence mode="wait">
      {isTransitioning && targetTheme && (
        <div
          key={targetTheme}
          className="fixed inset-0 pointer-events-none z-[100] overflow-hidden"
        >
          {/* Real-time Liquid Paint Surge Canvas */}
          <canvas
            ref={canvasRef}
            className="fixed inset-0 w-full h-full pointer-events-none z-[101]"
          />
        </div>
      )}
    </AnimatePresence>
  )
}
