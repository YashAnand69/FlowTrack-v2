'use client'

import React, { useEffect, useRef } from 'react'
import { useTheme } from '@/lib/context/ThemeContext'

interface FluidDyeDrop {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  life: number
  maxLife: number
  alpha: number
  baseAlpha: number
}

interface CausticWave {
  x: number
  y: number
  radius: number
  maxRadius: number
  alpha: number
  speed: number
}

interface FluidRibbonStream {
  points: Array<{ x: number; y: number; vx: number; vy: number; baseWave: number }>
  width: number
  baseY: number
  phase: number
  speed: number
  amplitude: number
}

export function FluidDynamicsCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const { theme } = useTheme()
  const mouseRef = useRef({
    x: -1000,
    y: -1000,
    vx: 0,
    vy: 0,
    speed: 0,
    lastX: -1000,
    lastY: -1000,
    active: false,
    down: false,
  })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    let animationFrameId: number
    let dpr = Math.min(window.devicePixelRatio || 1, 2)
    let width = window.innerWidth
    let height = window.innerHeight

    canvas.width = width * dpr
    canvas.height = height * dpr
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
    ctx.scale(dpr, dpr)

    const isDark = theme === 'dark'

    // Fluid collections
    const fluidDye: FluidDyeDrop[] = []
    const causticWaves: CausticWave[] = []

    // 4 Continuous liquid silk / caustic streams
    const ribbonCount = 4
    const ribbonSegments = 28
    const ribbons: FluidRibbonStream[] = []

    for (let r = 0; r < ribbonCount; r++) {
      const baseY = height * (0.18 + (r / (ribbonCount - 1 || 1)) * 0.68)
      const points = []
      for (let s = 0; s <= ribbonSegments; s++) {
        points.push({
          x: (width / ribbonSegments) * s,
          y: baseY,
          vx: 0,
          vy: 0,
          baseWave: 0,
        })
      }
      ribbons.push({
        points,
        width: 140 + r * 45,
        baseY,
        phase: r * (Math.PI / 2.5),
        speed: 0.0012 + r * 0.0004,
        amplitude: 45 + r * 18,
      })
    }

    const handleResize = () => {
      if (!canvas) return
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = window.innerWidth
      height = window.innerHeight

      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.scale(dpr, dpr)

      // Re-anchor ribbon points
      ribbons.forEach((ribbon, r) => {
        ribbon.baseY = height * (0.18 + (r / (ribbonCount - 1 || 1)) * 0.68)
        ribbon.points.forEach((p, s) => {
          p.x = (width / ribbonSegments) * s
          p.y = ribbon.baseY
        })
      })
    }

    const emitFluid = (x: number, y: number, vx: number, vy: number, speed: number) => {
      const count = Math.min(Math.max(Math.ceil(speed / 4), 2), 6)
      for (let c = 0; c < count; c++) {
        const spread = (Math.random() - 0.5) * 20
        const radius = Math.min(45 + speed * 1.5 + Math.random() * 30, 140)
        fluidDye.push({
          x: x + spread,
          y: y + spread,
          vx: vx * 0.25 + (Math.random() - 0.5) * 1.8,
          vy: vy * 0.25 + (Math.random() - 0.5) * 1.8,
          radius,
          life: 0,
          maxLife: 40 + Math.random() * 30,
          alpha: isDark ? 0.35 + Math.random() * 0.15 : 0.22 + Math.random() * 0.12,
          baseAlpha: isDark ? 0.35 + Math.random() * 0.15 : 0.22 + Math.random() * 0.12,
        })
      }

      // Limit array length for buttery 60FPS
      if (fluidDye.length > 90) {
        fluidDye.splice(0, fluidDye.length - 90)
      }
    }

    const handlePointerMove = (e: PointerEvent | MouseEvent) => {
      const mouse = mouseRef.current
      const currentX = e.clientX
      const currentY = e.clientY

      if (mouse.lastX === -1000) {
        mouse.lastX = currentX
        mouse.lastY = currentY
      }

      const dx = currentX - mouse.lastX
      const dy = currentY - mouse.lastY
      const currentSpeed = Math.sqrt(dx * dx + dy * dy)

      mouse.vx = dx * 0.5
      mouse.vy = dy * 0.5
      mouse.speed = currentSpeed
      mouse.x = currentX
      mouse.y = currentY
      mouse.active = true

      // Interpolate smooth continuous fluid emission along pointer trajectory
      const steps = Math.min(Math.max(Math.ceil(currentSpeed / 8), 1), 6)
      for (let s = 1; s <= steps; s++) {
        const t = s / steps
        const ix = mouse.lastX + dx * t
        const iy = mouse.lastY + dy * t
        emitFluid(ix, iy, mouse.vx, mouse.vy, currentSpeed)
      }

      mouse.lastX = currentX
      mouse.lastY = currentY
    }

    const handlePointerDown = (e: PointerEvent | MouseEvent) => {
      mouseRef.current.down = true
      // Expanding liquid caustic shockwave
      causticWaves.push({
        x: e.clientX,
        y: e.clientY,
        radius: 15,
        maxRadius: Math.min(width, height) * 0.5,
        alpha: isDark ? 0.45 : 0.32,
        speed: 8.5,
      })

      // Dense burst of liquid dye
      for (let a = 0; a < 8; a++) {
        const angle = (a / 8) * Math.PI * 2
        fluidDye.push({
          x: e.clientX + Math.cos(angle) * 20,
          y: e.clientY + Math.sin(angle) * 20,
          vx: Math.cos(angle) * 3.5,
          vy: Math.sin(angle) * 3.5,
          radius: 90,
          life: 0,
          maxLife: 50,
          alpha: isDark ? 0.45 : 0.3,
          baseAlpha: isDark ? 0.45 : 0.3,
        })
      }
    }

    const handlePointerUp = () => {
      mouseRef.current.down = false
    }

    const handlePointerLeave = () => {
      mouseRef.current.active = false
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('pointermove', handlePointerMove, { passive: true })
    window.addEventListener('pointerdown', handlePointerDown)
    window.addEventListener('pointerup', handlePointerUp)
    document.addEventListener('pointerleave', handlePointerLeave)

    let time = 0

    // Main 60FPS Fluid Dynamics Render Loop
    const render = () => {
      time += 0.016
      ctx.clearRect(0, 0, width, height)

      const mouse = mouseRef.current
      mouse.vx *= 0.9
      mouse.vy *= 0.9
      mouse.speed *= 0.9

      // ======================================================================
      // 1. VISIBLE CONTINUOUS SILKY LIQUID SATIN STREAMS
      // ======================================================================
      for (let r = 0; r < ribbons.length; r++) {
        const ribbon = ribbons[r]
        const points = ribbon.points

        // Multi-frequency harmonic Navier-Stokes liquid wave math
        for (let s = 0; s < points.length; s++) {
          const p = points[s]
          const normX = p.x / width

          const wave =
            Math.sin(time * 0.9 + normX * 3.8 + ribbon.phase) * ribbon.amplitude +
            Math.sin(time * 1.6 + normX * 6.5) * (ribbon.amplitude * 0.45) +
            Math.cos(time * 0.6 + normX * 2.2) * (ribbon.amplitude * 0.6)

          // Fluid displacement from cursor
          if (mouse.active) {
            const dx = p.x - mouse.x
            const dy = p.y - mouse.y
            const dist = Math.sqrt(dx * dx + dy * dy)
            const influence = 220

            if (dist < influence) {
              const factor = (1 - dist / influence) * (mouse.down ? 45 : 28)
              const angle = Math.atan2(dy, dx)
              p.vx += Math.cos(angle) * factor * 0.2 + mouse.vx * factor * 0.08
              p.vy += Math.sin(angle) * factor * 0.2 + mouse.vy * factor * 0.08
            }
          }

          // Viscous restoration
          const targetY = ribbon.baseY + wave
          p.vy = (p.vy + (targetY - p.y) * 0.045) * 0.86
          p.vx *= 0.86

          p.y += p.vy
          p.x += p.vx
        }

        // Draw continuous smooth Bézier ribbon
        ctx.beginPath()
        ctx.moveTo(points[0].x, points[0].y - ribbon.width * 0.5)

        for (let i = 0; i < points.length - 1; i++) {
          const p0 = points[i]
          const p1 = points[i + 1]
          const mx = (p0.x + p1.x) * 0.5
          const my = (p0.y + p1.y) * 0.5 - ribbon.width * 0.5
          ctx.quadraticCurveTo(p0.x, p0.y - ribbon.width * 0.5, mx, my)
        }
        const lastP = points[points.length - 1]
        ctx.lineTo(lastP.x, lastP.y - ribbon.width * 0.5)

        // Bottom boundary reverse
        ctx.lineTo(lastP.x, lastP.y + ribbon.width * 0.5)
        for (let i = points.length - 1; i > 0; i--) {
          const p0 = points[i]
          const p1 = points[i - 1]
          const mx = (p0.x + p1.x) * 0.5
          const my = (p0.y + p1.y) * 0.5 + ribbon.width * 0.5
          ctx.quadraticCurveTo(p0.x, p0.y + ribbon.width * 0.5, mx, my)
        }
        ctx.lineTo(points[0].x, points[0].y + ribbon.width * 0.5)
        ctx.closePath()

        // Luminous volumetric fluid gradient fill
        const ribbonGrad = ctx.createLinearGradient(
          0,
          ribbon.baseY - ribbon.width,
          0,
          ribbon.baseY + ribbon.width
        )
        if (isDark) {
          ribbonGrad.addColorStop(0, 'rgba(255, 255, 255, 0)')
          ribbonGrad.addColorStop(0.5, `rgba(255, 255, 255, ${0.045 + r * 0.015})`)
          ribbonGrad.addColorStop(1, 'rgba(255, 255, 255, 0)')
        } else {
          ribbonGrad.addColorStop(0, 'rgba(0, 0, 0, 0)')
          ribbonGrad.addColorStop(0.5, `rgba(0, 0, 0, ${0.035 + r * 0.012})`)
          ribbonGrad.addColorStop(1, 'rgba(0, 0, 0, 0)')
        }

        ctx.fillStyle = ribbonGrad
        ctx.fill()
      }

      // ======================================================================
      // 2. VOLUMETRIC LIQUID SMOKE & DYE SWIRLS (Mouse interactive fluid)
      // ======================================================================
      for (let i = fluidDye.length - 1; i >= 0; i--) {
        const d = fluidDye[i]

        // Fluid curl & viscous advection
        const curlX = Math.sin(d.y * 0.015 + time * 2) * 0.65
        const curlY = Math.cos(d.x * 0.015 + time * 2) * 0.65

        d.x += d.vx + curlX
        d.y += d.vy + curlY
        d.vx *= 0.93
        d.vy *= 0.93
        d.radius += 0.8 // Natural continuous fluid expansion
        d.life++

        const progress = d.life / d.maxLife
        const alpha = (1 - progress) * d.baseAlpha

        if (progress >= 1) {
          fluidDye.splice(i, 1)
          continue
        }

        // Render soft Gaussian liquid smoke puff with glowing core
        const dyeGrad = ctx.createRadialGradient(d.x, d.y, 0, d.x, d.y, d.radius)
        if (isDark) {
          dyeGrad.addColorStop(0, `rgba(255, 255, 255, ${alpha * 0.95})`)
          dyeGrad.addColorStop(0.35, `rgba(255, 255, 255, ${alpha * 0.55})`)
          dyeGrad.addColorStop(0.7, `rgba(255, 255, 255, ${alpha * 0.2})`)
          dyeGrad.addColorStop(1, 'rgba(255, 255, 255, 0)')
        } else {
          dyeGrad.addColorStop(0, `rgba(0, 0, 0, ${alpha * 0.85})`)
          dyeGrad.addColorStop(0.35, `rgba(0, 0, 0, ${alpha * 0.45})`)
          dyeGrad.addColorStop(0.7, `rgba(0, 0, 0, ${alpha * 0.15})`)
          dyeGrad.addColorStop(1, 'rgba(0, 0, 0, 0)')
        }

        ctx.fillStyle = dyeGrad
        ctx.beginPath()
        ctx.arc(d.x, d.y, d.radius, 0, Math.PI * 2)
        ctx.fill()
      }

      // ======================================================================
      // 3. EXPANDING LIQUID CAUSTIC RIPPLE WAVES
      // ======================================================================
      for (let r = causticWaves.length - 1; r >= 0; r--) {
        const rip = causticWaves[r]
        rip.radius += rip.speed
        rip.alpha *= 0.94

        if (rip.radius >= rip.maxRadius || rip.alpha < 0.005) {
          causticWaves.splice(r, 1)
          continue
        }

        const ripGrad = ctx.createRadialGradient(
          rip.x,
          rip.y,
          Math.max(0, rip.radius - 40),
          rip.x,
          rip.y,
          rip.radius
        )
        if (isDark) {
          ripGrad.addColorStop(0, 'rgba(255, 255, 255, 0)')
          ripGrad.addColorStop(0.7, `rgba(255, 255, 255, ${rip.alpha * 0.6})`)
          ripGrad.addColorStop(1, 'rgba(255, 255, 255, 0)')
        } else {
          ripGrad.addColorStop(0, 'rgba(0, 0, 0, 0)')
          ripGrad.addColorStop(0.7, `rgba(0, 0, 0, ${rip.alpha * 0.45})`)
          ripGrad.addColorStop(1, 'rgba(0, 0, 0, 0)')
        }

        ctx.fillStyle = ripGrad
        ctx.beginPath()
        ctx.arc(rip.x, rip.y, rip.radius, 0, Math.PI * 2)
        ctx.fill()
      }

      // ======================================================================
      // 4. LUMINOUS VISCOUS LIQUID CURSOR CAUSTIC SPOTLIGHT
      // ======================================================================
      if (mouse.active && mouse.x > 0) {
        const causticRadius = 240 + mouse.speed * 3.0
        const causticGrad = ctx.createRadialGradient(
          mouse.x,
          mouse.y,
          0,
          mouse.x,
          mouse.y,
          causticRadius
        )

        if (isDark) {
          causticGrad.addColorStop(0, 'rgba(255, 255, 255, 0.12)')
          causticGrad.addColorStop(0.3, 'rgba(255, 255, 255, 0.05)')
          causticGrad.addColorStop(0.65, 'rgba(255, 255, 255, 0.015)')
          causticGrad.addColorStop(1, 'rgba(255, 255, 255, 0)')
        } else {
          causticGrad.addColorStop(0, 'rgba(0, 0, 0, 0.09)')
          causticGrad.addColorStop(0.3, 'rgba(0, 0, 0, 0.035)')
          causticGrad.addColorStop(0.65, 'rgba(0, 0, 0, 0.01)')
          causticGrad.addColorStop(1, 'rgba(0, 0, 0, 0)')
        }

        ctx.fillStyle = causticGrad
        ctx.beginPath()
        ctx.arc(mouse.x, mouse.y, causticRadius, 0, Math.PI * 2)
        ctx.fill()
      }

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerdown', handlePointerDown)
      window.removeEventListener('pointerup', handlePointerUp)
      document.removeEventListener('pointerleave', handlePointerLeave)
      cancelAnimationFrame(animationFrameId)
    }
  }, [theme])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[1] opacity-100 transition-opacity duration-300"
      aria-hidden="true"
    />
  )
}
