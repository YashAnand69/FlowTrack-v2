'use client'

import React, { useEffect, useRef } from 'react'
import { useTheme } from '@/lib/context/ThemeContext'

interface AmbientFluidBlob {
  x: number
  y: number
  originX: number
  originY: number
  vx: number
  vy: number
  radius: number
  baseRadius: number
  speed: number
  phaseX: number
  phaseY: number
  alpha: number
  harmonics: number[]
}

interface SmokePuff {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  maxRadius: number
  life: number
  maxLife: number
  alpha: number
}

interface LiquidTrailPoint {
  x: number
  y: number
  age: number
  vx: number
  vy: number
  radius: number
}

export function FluidDynamicsCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const { theme } = useTheme()
  const mouseRef = useRef({
    x: -1000,
    y: -1000,
    smoothX: -1000,
    smoothY: -1000,
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

    // 1. Organic Ambient Volumetric Liquid Blobs (Noticeable, elegant Lusion glow)
    const blobs: AmbientFluidBlob[] = [
      {
        x: width * 0.25,
        y: height * 0.25,
        originX: width * 0.25,
        originY: height * 0.25,
        vx: 0,
        vy: 0,
        radius: 440,
        baseRadius: 440,
        speed: 0.0008,
        phaseX: 0,
        phaseY: 1.2,
        alpha: isDark ? 0.16 : 0.09,
        harmonics: [3, 5, 2],
      },
      {
        x: width * 0.78,
        y: height * 0.22,
        originX: width * 0.78,
        originY: height * 0.22,
        vx: 0,
        vy: 0,
        radius: 480,
        baseRadius: 480,
        speed: 0.0006,
        phaseX: 2.4,
        phaseY: 3.1,
        alpha: isDark ? 0.18 : 0.10,
        harmonics: [4, 6, 3],
      },
      {
        x: width * 0.5,
        y: height * 0.58,
        originX: width * 0.5,
        originY: height * 0.58,
        vx: 0,
        vy: 0,
        radius: 520,
        baseRadius: 520,
        speed: 0.0007,
        phaseX: 4.2,
        phaseY: 0.8,
        alpha: isDark ? 0.15 : 0.085,
        harmonics: [3, 7, 4],
      },
      {
        x: width * 0.18,
        y: height * 0.82,
        originX: width * 0.18,
        originY: height * 0.82,
        vx: 0,
        vy: 0,
        radius: 420,
        baseRadius: 420,
        speed: 0.0009,
        phaseX: 1.8,
        phaseY: 4.5,
        alpha: isDark ? 0.16 : 0.09,
        harmonics: [5, 3, 2],
      },
      {
        x: width * 0.85,
        y: height * 0.78,
        originX: width * 0.85,
        originY: height * 0.78,
        vx: 0,
        vy: 0,
        radius: 460,
        baseRadius: 460,
        speed: 0.0007,
        phaseX: 3.5,
        phaseY: 2.2,
        alpha: isDark ? 0.17 : 0.095,
        harmonics: [4, 5, 3],
      },
    ]

    // 2. Fluid Smoke Puffs & Liquid Ribbons
    const smokePuffs: SmokePuff[] = []
    const liquidTrail: LiquidTrailPoint[] = []

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

      const positions = [
        { x: 0.25, y: 0.25 },
        { x: 0.78, y: 0.22 },
        { x: 0.5, y: 0.58 },
        { x: 0.18, y: 0.82 },
        { x: 0.85, y: 0.78 },
      ]
      positions.forEach((pos, idx) => {
        if (blobs[idx]) {
          blobs[idx].originX = width * pos.x
          blobs[idx].originY = height * pos.y
        }
      })
    }

    let lastEmitTime = 0

    const handlePointerMove = (e: PointerEvent | MouseEvent) => {
      const mouse = mouseRef.current
      const currentX = e.clientX
      const currentY = e.clientY

      if (mouse.lastX === -1000) {
        mouse.lastX = currentX
        mouse.lastY = currentY
        mouse.smoothX = currentX
        mouse.smoothY = currentY
      }

      const dx = currentX - mouse.lastX
      const dy = currentY - mouse.lastY
      const dist = Math.sqrt(dx * dx + dy * dy)

      mouse.vx = dx * 0.6
      mouse.vy = dy * 0.6
      mouse.speed = dist
      mouse.x = currentX
      mouse.y = currentY
      mouse.active = true

      // Add to continuous liquid ribbon trail
      if (dist > 2) {
        liquidTrail.push({
          x: currentX,
          y: currentY,
          age: 0,
          vx: dx * 0.1,
          vy: dy * 0.1,
          radius: Math.min(35 + dist * 1.2, 90),
        })
        if (liquidTrail.length > 28) {
          liquidTrail.shift()
        }
      }

      // Emit soft volumetric liquid vapor puff
      const now = performance.now()
      if (dist > 4 && now - lastEmitTime > 25 && smokePuffs.length < 35) {
        lastEmitTime = now
        smokePuffs.push({
          x: currentX,
          y: currentY,
          vx: dx * 0.18 + (Math.random() - 0.5) * 0.9,
          vy: dy * 0.18 + (Math.random() - 0.5) * 0.9,
          radius: Math.min(70 + dist * 1.8, 160),
          maxRadius: Math.min(160 + dist * 3.0, 320),
          life: 0,
          maxLife: 60 + Math.random() * 25,
          alpha: isDark ? Math.min(0.18 + dist * 0.003, 0.28) : Math.min(0.11 + dist * 0.002, 0.18),
        })
      }

      mouse.lastX = currentX
      mouse.lastY = currentY
    }

    const handlePointerDown = (e: PointerEvent | MouseEvent) => {
      mouseRef.current.down = true
      // Noticeable organic ripple on click
      smokePuffs.push({
        x: e.clientX,
        y: e.clientY,
        vx: 0,
        vy: 0,
        radius: 90,
        maxRadius: 360,
        life: 0,
        maxLife: 70,
        alpha: isDark ? 0.35 : 0.22,
      })
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
    document.addEventListener('mouseleave', handlePointerLeave)

    let time = 0

    // Master 60FPS Fluid Dynamics Render Loop
    const render = () => {
      time += 0.014
      ctx.clearRect(0, 0, width, height)

      const mouse = mouseRef.current

      // Spring-damped smooth cursor spotlight
      if (mouse.active) {
        mouse.smoothX += (mouse.x - mouse.smoothX) * 0.09
        mouse.smoothY += (mouse.y - mouse.smoothY) * 0.09
      }
      mouse.vx *= 0.92
      mouse.vy *= 0.92
      mouse.speed *= 0.92

      // ======================================================================
      // 1. ORGANIC AMBIENT VOLUMETRIC LIQUID LIGHT BLOBS (Noticeable, soft glow)
      // ======================================================================
      for (let i = 0; i < blobs.length; i++) {
        const b = blobs[i]

        // Smooth multi-frequency organic drift
        const targetX =
          b.originX +
          Math.sin(time * 0.9 + b.phaseX) * 110 +
          Math.cos(time * 0.45 + b.phaseY) * 55
        const targetY =
          b.originY +
          Math.cos(time * 0.8 + b.phaseY) * 90 +
          Math.sin(time * 0.55 + b.phaseX) * 50

        // Responsive liquid fluid interaction from cursor
        if (mouse.active) {
          const dx = b.x - mouse.smoothX
          const dy = b.y - mouse.smoothY
          const dist = Math.sqrt(dx * dx + dy * dy)
          const influence = 400

          if (dist < influence && dist > 1) {
            const factor = Math.pow(1 - dist / influence, 2) * (mouse.down ? 55 : 32)
            const angle = Math.atan2(dy, dx)
            b.vx += Math.cos(angle) * factor * 0.09
            b.vy += Math.sin(angle) * factor * 0.09
          }
        }

        // Viscous damping restoration
        b.vx = (b.vx + (targetX - b.x) * 0.022) * 0.89
        b.vy = (b.vy + (targetY - b.y) * 0.022) * 0.89

        b.x += b.vx
        b.y += b.vy

        // Breathing radius modulation
        const currentRadius =
          b.baseRadius + Math.sin(time * 1.4 + b.phaseX) * 45

        // Render soft Gaussian liquid glow orb
        const grad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, currentRadius)
        if (isDark) {
          grad.addColorStop(0, `rgba(255, 255, 255, ${b.alpha * 1.4})`)
          grad.addColorStop(0.3, `rgba(255, 255, 255, ${b.alpha * 0.75})`)
          grad.addColorStop(0.65, `rgba(255, 255, 255, ${b.alpha * 0.22})`)
          grad.addColorStop(1, 'rgba(255, 255, 255, 0)')
        } else {
          grad.addColorStop(0, `rgba(0, 0, 0, ${b.alpha * 1.2})`)
          grad.addColorStop(0.3, `rgba(0, 0, 0, ${b.alpha * 0.65})`)
          grad.addColorStop(0.65, `rgba(0, 0, 0, ${b.alpha * 0.18})`)
          grad.addColorStop(1, 'rgba(0, 0, 0, 0)')
        }

        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.arc(b.x, b.y, currentRadius, 0, Math.PI * 2)
        ctx.fill()
      }

      // ======================================================================
      // 2. FLUID VELOCITY WAKE TRAIL (Continuous fluid ribbon behind cursor)
      // ======================================================================
      for (let t = liquidTrail.length - 1; t >= 0; t--) {
        const pt = liquidTrail[t]
        pt.age++
        pt.x += pt.vx
        pt.y += pt.vy
        pt.vx *= 0.94
        pt.vy *= 0.94

        const maxAge = 25
        const ageProgress = pt.age / maxAge
        if (ageProgress >= 1) {
          liquidTrail.splice(t, 1)
          continue
        }

        const trailRadius = pt.radius * (1 + ageProgress * 0.6)
        const trailAlpha = (1 - ageProgress) * (isDark ? 0.14 : 0.08)

        const trailGrad = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, trailRadius)
        if (isDark) {
          trailGrad.addColorStop(0, `rgba(255, 255, 255, ${trailAlpha})`)
          trailGrad.addColorStop(0.5, `rgba(255, 255, 255, ${trailAlpha * 0.4})`)
          trailGrad.addColorStop(1, 'rgba(255, 255, 255, 0)')
        } else {
          trailGrad.addColorStop(0, `rgba(0, 0, 0, ${trailAlpha})`)
          trailGrad.addColorStop(0.5, `rgba(0, 0, 0, ${trailAlpha * 0.4})`)
          trailGrad.addColorStop(1, 'rgba(0, 0, 0, 0)')
        }

        ctx.fillStyle = trailGrad
        ctx.beginPath()
        ctx.arc(pt.x, pt.y, trailRadius, 0, Math.PI * 2)
        ctx.fill()
      }

      // ======================================================================
      // 3. SILKY LIQUID SMOKE PUFFS (Dissipating vapor ripples)
      // ======================================================================
      for (let s = smokePuffs.length - 1; s >= 0; s--) {
        const p = smokePuffs[s]
        p.life++

        p.x += p.vx
        p.y += p.vy
        p.vx *= 0.95
        p.vy *= 0.95

        const progress = p.life / p.maxLife
        const currentRadius = p.radius + (p.maxRadius - p.radius) * Math.sin((progress * Math.PI) / 2)
        const currentAlpha = p.alpha * Math.pow(1 - progress, 1.7)

        if (progress >= 1 || currentAlpha <= 0.002) {
          smokePuffs.splice(s, 1)
          continue
        }

        const smokeGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, currentRadius)
        if (isDark) {
          smokeGrad.addColorStop(0, `rgba(255, 255, 255, ${currentAlpha})`)
          smokeGrad.addColorStop(0.35, `rgba(255, 255, 255, ${currentAlpha * 0.5})`)
          smokeGrad.addColorStop(0.75, `rgba(255, 255, 255, ${currentAlpha * 0.12})`)
          smokeGrad.addColorStop(1, 'rgba(255, 255, 255, 0)')
        } else {
          smokeGrad.addColorStop(0, `rgba(0, 0, 0, ${currentAlpha * 0.9})`)
          smokeGrad.addColorStop(0.35, `rgba(0, 0, 0, ${currentAlpha * 0.45})`)
          smokeGrad.addColorStop(0.75, `rgba(0, 0, 0, ${currentAlpha * 0.1})`)
          smokeGrad.addColorStop(1, 'rgba(0, 0, 0, 0)')
        }

        ctx.fillStyle = smokeGrad
        ctx.beginPath()
        ctx.arc(p.x, p.y, currentRadius, 0, Math.PI * 2)
        ctx.fill()
      }

      // ======================================================================
      // 4. VISCOUS LIQUID CURSOR SPOTLIGHT
      // ======================================================================
      if (mouse.active && mouse.smoothX > 0) {
        const spotRadius = 260 + Math.min(mouse.speed * 2.2, 120)
        const spotGrad = ctx.createRadialGradient(
          mouse.smoothX,
          mouse.smoothY,
          0,
          mouse.smoothX,
          mouse.smoothY,
          spotRadius
        )

        if (isDark) {
          spotGrad.addColorStop(0, 'rgba(255, 255, 255, 0.12)')
          spotGrad.addColorStop(0.3, 'rgba(255, 255, 255, 0.055)')
          spotGrad.addColorStop(0.65, 'rgba(255, 255, 255, 0.012)')
          spotGrad.addColorStop(1, 'rgba(255, 255, 255, 0)')
        } else {
          spotGrad.addColorStop(0, 'rgba(0, 0, 0, 0.085)')
          spotGrad.addColorStop(0.3, 'rgba(0, 0, 0, 0.038)')
          spotGrad.addColorStop(0.65, 'rgba(0, 0, 0, 0.008)')
          spotGrad.addColorStop(1, 'rgba(0, 0, 0, 0)')
        }

        ctx.fillStyle = spotGrad
        ctx.beginPath()
        ctx.arc(mouse.smoothX, mouse.smoothY, spotRadius, 0, Math.PI * 2)
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
      document.removeEventListener('mouseleave', handlePointerLeave)
      cancelAnimationFrame(animationFrameId)
    }
  }, [theme])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[1] opacity-100 transition-opacity duration-500"
      aria-hidden="true"
    />
  )
}
