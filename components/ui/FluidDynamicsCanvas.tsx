'use client'

import React, { useEffect, useRef } from 'react'
import { useTheme } from '@/lib/context/ThemeContext'

interface FluidParticle {
  x: number
  y: number
  originX: number
  originY: number
  vx: number
  vy: number
  radius: number
  phase: number
}

export function FluidDynamicsCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const { theme } = useTheme()
  const mouseRef = useRef({ x: -1000, y: -1000, vx: 0, vy: 0, lastX: -1000, lastY: -1000, active: false })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    const isDark = theme === 'dark'

    // Create fluid grid points
    const spacing = 45
    const cols = Math.ceil(width / spacing) + 2
    const rows = Math.ceil(height / spacing) + 2
    const particles: FluidParticle[] = []

    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const x = i * spacing
        const y = j * spacing
        particles.push({
          x,
          y,
          originX: x,
          originY: y,
          vx: 0,
          vy: 0,
          radius: 1.2,
          phase: Math.random() * Math.PI * 2,
        })
      }
    }

    const handleResize = () => {
      if (!canvas) return
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }

    const handleMouseMove = (e: MouseEvent) => {
      const mouse = mouseRef.current
      if (mouse.lastX === -1000) {
        mouse.lastX = e.clientX
        mouse.lastY = e.clientY
      }
      mouse.vx = (e.clientX - mouse.lastX) * 0.45
      mouse.vy = (e.clientY - mouse.lastY) * 0.45
      mouse.x = e.clientX
      mouse.y = e.clientY
      mouse.lastX = e.clientX
      mouse.lastY = e.clientY
      mouse.active = true
    }

    const handleMouseLeave = () => {
      mouseRef.current.active = false
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    document.addEventListener('mouseleave', handleMouseLeave)

    let time = 0

    // Render & Fluid Simulation loop
    const render = () => {
      time += 0.015
      ctx.clearRect(0, 0, width, height)

      const mouse = mouseRef.current
      // Decay mouse velocity
      mouse.vx *= 0.92
      mouse.vy *= 0.92

      const influenceRadius = 140
      const influenceRadiusSq = influenceRadius * influenceRadius

      // Draw subtle ambient organic fluid trails
      const pointColor = isDark
        ? 'rgba(255, 255, 255, 0.045)'
        : 'rgba(0, 0, 0, 0.035)'
      const activeColor = isDark
        ? 'rgba(255, 255, 255, 0.22)'
        : 'rgba(0, 0, 0, 0.18)'

      ctx.fillStyle = pointColor

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]

        // Organic background fluid drift (Lusion wave harmonics)
        const waveX = Math.sin(time + p.phase + p.originY * 0.005) * 1.5
        const waveY = Math.cos(time + p.phase + p.originX * 0.005) * 1.5

        // Mouse fluid pressure & velocity interaction
        const dx = p.x - mouse.x
        const dy = p.y - mouse.y
        const distSq = dx * dx + dy * dy

        if (distSq < influenceRadiusSq && mouse.active) {
          const dist = Math.sqrt(distSq)
          const force = (1 - dist / influenceRadius) * 1.2
          const angle = Math.atan2(dy, dx)

          // Inject fluid push and directional drag
          p.vx += Math.cos(angle) * force * 3.5 + mouse.vx * force * 0.3
          p.vy += Math.sin(angle) * force * 3.5 + mouse.vy * force * 0.3
        }

        // Spring restore to origin with fluid damping
        const springForceX = (p.originX + waveX - p.x) * 0.035
        const springForceY = (p.originY + waveY - p.y) * 0.035

        p.vx = (p.vx + springForceX) * 0.88
        p.vy = (p.vy + springForceY) * 0.88

        p.x += p.vx
        p.y += p.vy

        // Draw particle
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy)
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius + Math.min(speed * 0.4, 2), 0, Math.PI * 2)

        if (speed > 0.4) {
          ctx.fillStyle = activeColor
          ctx.fill()
          ctx.fillStyle = pointColor
        } else {
          ctx.fill()
        }
      }

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseleave', handleMouseLeave)
      cancelAnimationFrame(animationFrameId)
    }
  }, [theme])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-80"
      aria-hidden="true"
    />
  )
}
