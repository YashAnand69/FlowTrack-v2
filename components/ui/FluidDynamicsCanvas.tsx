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

    // 1. Organic Ambient Liquid Light Orbs (Lusion background glow)
    const blobCount = 5
    const blobs: AmbientFluidBlob[] = []

    const seedPositions = [
      { x: 0.2, y: 0.25, r: 380 },
      { x: 0.8, y: 0.2, r: 420 },
      { x: 0.5, y: 0.55, r: 480 },
      { x: 0.15, y: 0.8, r: 360 },
      { x: 0.85, y: 0.75, r: 400 },
    ]

    seedPositions.forEach((pos, idx) => {
      const x = width * pos.x
      const y = height * pos.y
      blobs.push({
        x,
        y,
        originX: x,
        originY: y,
        vx: 0,
        vy: 0,
        radius: pos.r,
        baseRadius: pos.r,
        speed: 0.0006 + idx * 0.0002,
        phaseX: idx * 1.5,
        phaseY: idx * 2.1 + 1.0,
        alpha: isDark ? 0.065 + (idx % 2 === 0 ? 0.02 : 0) : 0.045 + (idx % 2 === 0 ? 0.015 : 0),
      })
    })

    // 2. Silky Smoke Puffs emitted smoothly by mouse motion
    const smokePuffs: SmokePuff[] = []

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

      seedPositions.forEach((pos, idx) => {
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

      mouse.vx = dx * 0.5
      mouse.vy = dy * 0.5
      mouse.speed = dist
      mouse.x = currentX
      mouse.y = currentY
      mouse.active = true

      // Emit smooth, soft ethereal smoke puffs as mouse travels
      const now = performance.now()
      if (dist > 3 && now - lastEmitTime > 30 && smokePuffs.length < 35) {
        lastEmitTime = now
        smokePuffs.push({
          x: currentX,
          y: currentY,
          vx: dx * 0.15 + (Math.random() - 0.5) * 0.8,
          vy: dy * 0.15 + (Math.random() - 0.5) * 0.8,
          radius: Math.min(60 + dist * 1.5, 140),
          maxRadius: Math.min(130 + dist * 2.5, 260),
          life: 0,
          maxLife: 65 + Math.random() * 25,
          alpha: isDark ? Math.min(0.09 + dist * 0.002, 0.18) : Math.min(0.06 + dist * 0.0015, 0.12),
        })
      }

      mouse.lastX = currentX
      mouse.lastY = currentY
    }

    const handlePointerDown = (e: PointerEvent | MouseEvent) => {
      mouseRef.current.down = true
      // Soft ambient pressure pulse on click
      smokePuffs.push({
        x: e.clientX,
        y: e.clientY,
        vx: 0,
        vy: 0,
        radius: 80,
        maxRadius: 320,
        life: 0,
        maxLife: 75,
        alpha: isDark ? 0.22 : 0.15,
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
    document.addEventListener('pointerleave', handlePointerLeave)

    let time = 0

    // Master 60FPS Fluid Render Loop
    const render = () => {
      time += 0.012
      ctx.clearRect(0, 0, width, height)

      const mouse = mouseRef.current

      // Butter-smooth spring interpolation for cursor spotlight
      if (mouse.active) {
        mouse.smoothX += (mouse.x - mouse.smoothX) * 0.085
        mouse.smoothY += (mouse.y - mouse.smoothY) * 0.085
      }
      mouse.vx *= 0.92
      mouse.vy *= 0.92
      mouse.speed *= 0.92

      // ======================================================================
      // 1. ORGANIC LIQUID AMBIENT LIGHT BLOBS (Calm, floating, deep Lusion glow)
      // ======================================================================
      for (let i = 0; i < blobs.length; i++) {
        const b = blobs[i]

        // Smooth multi-frequency harmonic drift
        const targetX =
          b.originX +
          Math.sin(time * 0.8 + b.phaseX) * 90 +
          Math.cos(time * 0.4 + b.phaseY) * 45
        const targetY =
          b.originY +
          Math.cos(time * 0.7 + b.phaseY) * 75 +
          Math.sin(time * 0.5 + b.phaseX) * 40

        // Gentle liquid repulsion / attraction from cursor
        if (mouse.active) {
          const dx = b.x - mouse.smoothX
          const dy = b.y - mouse.smoothY
          const dist = Math.sqrt(dx * dx + dy * dy)
          const influence = 350

          if (dist < influence && dist > 1) {
            const factor = Math.pow(1 - dist / influence, 2) * (mouse.down ? 45 : 25)
            const angle = Math.atan2(dy, dx)
            b.vx += Math.cos(angle) * factor * 0.08
            b.vy += Math.sin(angle) * factor * 0.08
          }
        }

        // Damped viscous restoration
        b.vx = (b.vx + (targetX - b.x) * 0.02) * 0.9
        b.vy = (b.vy + (targetY - b.y) * 0.02) * 0.9

        b.x += b.vx
        b.y += b.vy

        // Breathing radius modulation
        const currentRadius =
          b.baseRadius + Math.sin(time * 1.2 + b.phaseX) * 35

        // Render soft Gaussian liquid glow orb
        const grad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, currentRadius)
        if (isDark) {
          grad.addColorStop(0, `rgba(255, 255, 255, ${b.alpha * 1.3})`)
          grad.addColorStop(0.35, `rgba(255, 255, 255, ${b.alpha * 0.7})`)
          grad.addColorStop(0.7, `rgba(255, 255, 255, ${b.alpha * 0.2})`)
          grad.addColorStop(1, 'rgba(255, 255, 255, 0)')
        } else {
          grad.addColorStop(0, `rgba(0, 0, 0, ${b.alpha * 1.1})`)
          grad.addColorStop(0.35, `rgba(0, 0, 0, ${b.alpha * 0.6})`)
          grad.addColorStop(0.7, `rgba(0, 0, 0, ${b.alpha * 0.15})`)
          grad.addColorStop(1, 'rgba(0, 0, 0, 0)')
        }

        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.arc(b.x, b.y, currentRadius, 0, Math.PI * 2)
        ctx.fill()
      }

      // ======================================================================
      // 2. SILKY SMOOTH LIQUID SMOKE PUFFS (Dissipates like silk in water)
      // ======================================================================
      for (let s = smokePuffs.length - 1; s >= 0; s--) {
        const p = smokePuffs[s]
        p.life++

        p.x += p.vx
        p.y += p.vy
        p.vx *= 0.94
        p.vy *= 0.94

        const progress = p.life / p.maxLife
        // Smooth cubic ease-out expansion & soft fade
        const currentRadius = p.radius + (p.maxRadius - p.radius) * Math.sin((progress * Math.PI) / 2)
        const currentAlpha = p.alpha * Math.pow(1 - progress, 1.8)

        if (progress >= 1 || currentAlpha <= 0.002) {
          smokePuffs.splice(s, 1)
          continue
        }

        const smokeGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, currentRadius)
        if (isDark) {
          smokeGrad.addColorStop(0, `rgba(255, 255, 255, ${currentAlpha * 0.9})`)
          smokeGrad.addColorStop(0.4, `rgba(255, 255, 255, ${currentAlpha * 0.45})`)
          smokeGrad.addColorStop(0.8, `rgba(255, 255, 255, ${currentAlpha * 0.1})`)
          smokeGrad.addColorStop(1, 'rgba(255, 255, 255, 0)')
        } else {
          smokeGrad.addColorStop(0, `rgba(0, 0, 0, ${currentAlpha * 0.85})`)
          smokeGrad.addColorStop(0.4, `rgba(0, 0, 0, ${currentAlpha * 0.4})`)
          smokeGrad.addColorStop(0.8, `rgba(0, 0, 0, ${currentAlpha * 0.08})`)
          smokeGrad.addColorStop(1, 'rgba(0, 0, 0, 0)')
        }

        ctx.fillStyle = smokeGrad
        ctx.beginPath()
        ctx.arc(p.x, p.y, currentRadius, 0, Math.PI * 2)
        ctx.fill()
      }

      // ======================================================================
      // 3. BUTTERY VISCOUS LIQUID CURSOR SPOTLIGHT (Lusion signature glow)
      // ======================================================================
      if (mouse.active && mouse.smoothX > 0) {
        const spotRadius = 240 + Math.min(mouse.speed * 2.0, 100)
        const spotGrad = ctx.createRadialGradient(
          mouse.smoothX,
          mouse.smoothY,
          0,
          mouse.smoothX,
          mouse.smoothY,
          spotRadius
        )

        if (isDark) {
          spotGrad.addColorStop(0, 'rgba(255, 255, 255, 0.075)')
          spotGrad.addColorStop(0.3, 'rgba(255, 255, 255, 0.035)')
          spotGrad.addColorStop(0.65, 'rgba(255, 255, 255, 0.008)')
          spotGrad.addColorStop(1, 'rgba(255, 255, 255, 0)')
        } else {
          spotGrad.addColorStop(0, 'rgba(0, 0, 0, 0.055)')
          spotGrad.addColorStop(0.3, 'rgba(0, 0, 0, 0.025)')
          spotGrad.addColorStop(0.65, 'rgba(0, 0, 0, 0.006)')
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
