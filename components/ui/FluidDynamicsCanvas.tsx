'use client'

import React, { useEffect, useRef } from 'react'
import { useTheme } from '@/lib/context/ThemeContext'

interface FluidPoint {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  life: number
  maxLife: number
  density: number
}

interface FluidRibbon {
  points: Array<{ x: number; y: number; vx: number; vy: number }>
  color: string
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
    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    const isDark = theme === 'dark'

    // Fluid dye trails & fluid eddies (continuous liquid smoke)
    const fluidDye: FluidPoint[] = []
    const fluidRipples: Array<{
      x: number
      y: number
      radius: number
      maxRadius: number
      alpha: number
      speed: number
    }> = []

    // Ambient liquid satin ribbons that undulate continuously
    const ribbonCount = 5
    const ribbonSegments = 24
    const ribbons: FluidRibbon[] = []

    for (let r = 0; r < ribbonCount; r++) {
      const baseY = height * (0.2 + (r / ribbonCount) * 0.65)
      const points = []
      for (let s = 0; s <= ribbonSegments; s++) {
        points.push({
          x: (width / ribbonSegments) * s,
          y: baseY,
          vx: 0,
          vy: 0,
        })
      }
      ribbons.push({
        points,
        color: isDark
          ? `rgba(255, 255, 255, ${0.015 + r * 0.008})`
          : `rgba(0, 0, 0, ${0.012 + r * 0.006})`,
        width: 120 + r * 30,
        baseY,
        phase: r * (Math.PI / 3),
        speed: 0.0008 + r * 0.0003,
        amplitude: 35 + r * 15,
      })
    }

    const handleResize = () => {
      if (!canvas) return
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight

      // Re-anchor ribbons
      ribbons.forEach((ribbon, r) => {
        ribbon.baseY = height * (0.2 + (r / ribbonCount) * 0.65)
        ribbon.points.forEach((p, s) => {
          p.x = (width / ribbonSegments) * s
          p.y = ribbon.baseY
        })
      })
    }

    const handleMouseMove = (e: MouseEvent) => {
      const mouse = mouseRef.current
      if (mouse.lastX === -1000) {
        mouse.lastX = e.clientX
        mouse.lastY = e.clientY
      }

      const dx = e.clientX - mouse.lastX
      const dy = e.clientY - mouse.lastY
      const currentSpeed = Math.sqrt(dx * dx + dy * dy)

      mouse.vx = dx * 0.6
      mouse.vy = dy * 0.6
      mouse.speed = currentSpeed
      mouse.x = e.clientX
      mouse.y = e.clientY
      mouse.active = true

      // Interpolate smooth continuous fluid dye emission along mouse path
      const steps = Math.min(Math.ceil(currentSpeed / 6), 8)
      for (let s = 0; s <= steps; s++) {
        const t = s / steps
        const ix = mouse.lastX + dx * t
        const iy = mouse.lastY + dy * t

        if (fluidDye.length < 120) {
          fluidDye.push({
            x: ix,
            y: iy,
            vx: (dx * 0.15 + (Math.random() - 0.5) * 1.5) * 0.8,
            vy: (dy * 0.15 + (Math.random() - 0.5) * 1.5) * 0.8,
            radius: Math.min(30 + currentSpeed * 1.2, 95),
            life: 1,
            maxLife: 45 + Math.random() * 25,
            density: Math.min(0.18 + (currentSpeed / 60) * 0.12, 0.35),
          })
        }
      }

      mouse.lastX = e.clientX
      mouse.lastY = e.clientY
    }

    const handleMouseDown = (e: MouseEvent) => {
      mouseRef.current.down = true
      // Spawn smooth liquid radial displacement wave
      fluidRipples.push({
        x: e.clientX,
        y: e.clientY,
        radius: 10,
        maxRadius: Math.min(width, height) * 0.45,
        alpha: isDark ? 0.25 : 0.18,
        speed: 7.5,
      })

      // Dense fluid burst
      for (let a = 0; a < 6; a++) {
        const angle = (a / 6) * Math.PI * 2
        fluidDye.push({
          x: e.clientX + Math.cos(angle) * 15,
          y: e.clientY + Math.sin(angle) * 15,
          vx: Math.cos(angle) * 2.5,
          vy: Math.sin(angle) * 2.5,
          radius: 80,
          life: 1,
          maxLife: 55,
          density: 0.3,
        })
      }
    }

    const handleMouseUp = () => {
      mouseRef.current.down = false
    }

    const handleMouseLeave = () => {
      mouseRef.current.active = false
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mouseup', handleMouseUp)
    document.addEventListener('mouseleave', handleMouseLeave)

    let time = 0

    // Main 60FPS Continuous Fluid Rendering Engine
    const render = () => {
      time += 0.015
      ctx.clearRect(0, 0, width, height)

      const mouse = mouseRef.current
      mouse.vx *= 0.92
      mouse.vy *= 0.92
      mouse.speed *= 0.92

      // ======================================================================
      // 1. SILKY CONTINUOUS LIQUID SATIN RIBBONS (Organic ambient flow)
      // ======================================================================
      for (let r = 0; r < ribbons.length; r++) {
        const ribbon = ribbons[r]
        const points = ribbon.points

        // Deform points with harmonic Navier-Stokes wave math & mouse drag
        for (let s = 0; s < points.length; s++) {
          const p = points[s]
          const normX = p.x / width

          // Multi-harmonic fluid wave function
          const wave =
            Math.sin(time * 0.8 + normX * 4 + ribbon.phase) * ribbon.amplitude +
            Math.sin(time * 1.5 + normX * 7) * (ribbon.amplitude * 0.35) +
            Math.cos(time * 0.5 + normX * 2) * (ribbon.amplitude * 0.5)

          // Mouse fluid drag & push on the liquid ribbon
          if (mouse.active) {
            const dx = p.x - mouse.x
            const dy = p.y - mouse.y
            const dist = Math.sqrt(dx * dx + dy * dy)
            const influence = 180

            if (dist < influence) {
              const factor = (1 - dist / influence) * (mouse.down ? 35 : 20)
              const angle = Math.atan2(dy, dx)
              p.vx += Math.cos(angle) * factor * 0.15 + mouse.vx * factor * 0.05
              p.vy += Math.sin(angle) * factor * 0.15 + mouse.vy * factor * 0.05
            }
          }

          // Damped spring restoration
          const targetY = ribbon.baseY + wave
          p.vy = (p.vy + (targetY - p.y) * 0.04) * 0.88
          p.vx *= 0.88

          p.y += p.vy
          p.x += p.vx
        }

        // Draw continuous smooth Bézier liquid stream band
        ctx.beginPath()
        ctx.moveTo(points[0].x, points[0].y - ribbon.width * 0.5)

        // Top curve
        for (let i = 0; i < points.length - 1; i++) {
          const p0 = points[i]
          const p1 = points[i + 1]
          const mx = (p0.x + p1.x) * 0.5
          const my = (p0.y + p1.y) * 0.5 - ribbon.width * 0.5
          ctx.quadraticCurveTo(p0.x, p0.y - ribbon.width * 0.5, mx, my)
        }
        const lastP = points[points.length - 1]
        ctx.lineTo(lastP.x, lastP.y - ribbon.width * 0.5)

        // Bottom curve (reverse)
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

        // Volumetric liquid gradient fill
        const gradient = ctx.createLinearGradient(0, ribbon.baseY - ribbon.width, 0, ribbon.baseY + ribbon.width)
        if (isDark) {
          gradient.addColorStop(0, 'rgba(255, 255, 255, 0)')
          gradient.addColorStop(0.5, `rgba(255, 255, 255, ${0.018 + r * 0.007})`)
          gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
        } else {
          gradient.addColorStop(0, 'rgba(0, 0, 0, 0)')
          gradient.addColorStop(0.5, `rgba(0, 0, 0, ${0.012 + r * 0.005})`)
          gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')
        }

        ctx.fillStyle = gradient
        ctx.fill()
      }

      // ======================================================================
      // 2. CONTINUOUS LIQUID SMOKE & DYE TRAILS (Mouse fluid caustics)
      // ======================================================================
      for (let i = fluidDye.length - 1; i >= 0; i--) {
        const d = fluidDye[i]

        // Advect with natural viscous fluid curls
        const curl = Math.sin(d.y * 0.02 + time) * 0.4
        d.x += d.vx + curl
        d.y += d.vy
        d.vx *= 0.94
        d.vy *= 0.94
        d.radius += 0.45 // Continuous expansion like liquid dye in water
        d.life++

        const progress = d.life / d.maxLife
        const alpha = (1 - progress) * d.density

        if (progress >= 1) {
          fluidDye.splice(i, 1)
          continue
        }

        // Render soft Gaussian liquid dye puff
        const dyeGrad = ctx.createRadialGradient(d.x, d.y, 0, d.x, d.y, d.radius)
        if (isDark) {
          dyeGrad.addColorStop(0, `rgba(255, 255, 255, ${alpha * 0.65})`)
          dyeGrad.addColorStop(0.4, `rgba(255, 255, 255, ${alpha * 0.25})`)
          dyeGrad.addColorStop(1, 'rgba(255, 255, 255, 0)')
        } else {
          dyeGrad.addColorStop(0, `rgba(0, 0, 0, ${alpha * 0.5})`)
          dyeGrad.addColorStop(0.4, `rgba(0, 0, 0, ${alpha * 0.18})`)
          dyeGrad.addColorStop(1, 'rgba(0, 0, 0, 0)')
        }

        ctx.fillStyle = dyeGrad
        ctx.beginPath()
        ctx.arc(d.x, d.y, d.radius, 0, Math.PI * 2)
        ctx.fill()
      }

      // ======================================================================
      // 3. CONTINUOUS LIQUID RIPPLE DISPLACEMENT WAVES
      // ======================================================================
      for (let r = fluidRipples.length - 1; r >= 0; r--) {
        const rip = fluidRipples[r]
        rip.radius += rip.speed
        rip.alpha *= 0.95

        if (rip.radius >= rip.maxRadius || rip.alpha < 0.005) {
          fluidRipples.splice(r, 1)
          continue
        }

        const ripGrad = ctx.createRadialGradient(
          rip.x,
          rip.y,
          Math.max(0, rip.radius - 35),
          rip.x,
          rip.y,
          rip.radius
        )
        if (isDark) {
          ripGrad.addColorStop(0, 'rgba(255, 255, 255, 0)')
          ripGrad.addColorStop(0.7, `rgba(255, 255, 255, ${rip.alpha * 0.4})`)
          ripGrad.addColorStop(1, 'rgba(255, 255, 255, 0)')
        } else {
          ripGrad.addColorStop(0, 'rgba(0, 0, 0, 0)')
          ripGrad.addColorStop(0.7, `rgba(0, 0, 0, ${rip.alpha * 0.3})`)
          ripGrad.addColorStop(1, 'rgba(0, 0, 0, 0)')
        }

        ctx.fillStyle = ripGrad
        ctx.beginPath()
        ctx.arc(rip.x, rip.y, rip.radius, 0, Math.PI * 2)
        ctx.fill()
      }

      // ======================================================================
      // 4. AMBIENT VISCOUS LIQUID CURSOR CAUSTIC SPOTLIGHT
      // ======================================================================
      if (mouse.active && mouse.x > 0) {
        const causticRadius = 220 + mouse.speed * 2.5
        const causticGrad = ctx.createRadialGradient(
          mouse.x,
          mouse.y,
          0,
          mouse.x,
          mouse.y,
          causticRadius
        )

        if (isDark) {
          causticGrad.addColorStop(0, 'rgba(255, 255, 255, 0.065)')
          causticGrad.addColorStop(0.35, 'rgba(255, 255, 255, 0.02)')
          causticGrad.addColorStop(0.7, 'rgba(255, 255, 255, 0.005)')
          causticGrad.addColorStop(1, 'rgba(255, 255, 255, 0)')
        } else {
          causticGrad.addColorStop(0, 'rgba(0, 0, 0, 0.045)')
          causticGrad.addColorStop(0.35, 'rgba(0, 0, 0, 0.015)')
          causticGrad.addColorStop(0.7, 'rgba(0, 0, 0, 0.003)')
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
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('mouseleave', handleMouseLeave)
      cancelAnimationFrame(animationFrameId)
    }
  }, [theme])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-100 transition-opacity duration-300"
      aria-hidden="true"
    />
  )
}
