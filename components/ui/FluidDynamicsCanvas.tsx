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
  baseRadius: number
  mass: number
  angle: number
  spin: number
  life: number
  maxLife: number
  colorAlpha: number
}

interface FluidVortex {
  x: number
  y: number
  vx: number
  vy: number
  strength: number
  radius: number
  age: number
  maxAge: number
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

    // Simulation parameters
    const spacing = 38
    const cols = Math.ceil(width / spacing) + 4
    const rows = Math.ceil(height / spacing) + 4
    const particles: FluidParticle[] = []
    const vortices: FluidVortex[] = []

    // Populate fluid mesh nodes
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const x = (i - 1) * spacing
        const y = (j - 1) * spacing
        particles.push({
          x,
          y,
          originX: x,
          originY: y,
          vx: (Math.random() - 0.5) * 0.2,
          vy: (Math.random() - 0.5) * 0.2,
          radius: 1.2,
          baseRadius: 1.0 + (i % 2 === 0 ? 0.4 : 0),
          mass: 0.8 + Math.random() * 0.4,
          angle: Math.random() * Math.PI * 2,
          spin: 0,
          life: 1,
          maxLife: 1,
          colorAlpha: 0.04,
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

      const dx = e.clientX - mouse.lastX
      const dy = e.clientY - mouse.lastY
      const currentSpeed = Math.sqrt(dx * dx + dy * dy)

      mouse.vx = dx * 0.5
      mouse.vy = dy * 0.5
      mouse.speed = currentSpeed
      mouse.x = e.clientX
      mouse.y = e.clientY
      mouse.lastX = e.clientX
      mouse.lastY = e.clientY
      mouse.active = true

      // Spawn dynamic fluid vortex eddy if mouse moves fast
      if (currentSpeed > 8 && vortices.length < 16) {
        vortices.push({
          x: e.clientX,
          y: e.clientY,
          vx: dx * 0.2,
          vy: dy * 0.2,
          strength: (dx > 0 ? 1 : -1) * Math.min(currentSpeed * 0.08, 2.5),
          radius: Math.min(60 + currentSpeed * 2, 160),
          age: 0,
          maxAge: 45 + Math.random() * 20,
        })
      }
    }

    const handleMouseDown = () => {
      mouseRef.current.down = true
      // Trigger hydraulic shockwave ripple
      vortices.push({
        x: mouseRef.current.x,
        y: mouseRef.current.y,
        vx: 0,
        vy: 0,
        strength: 3.5,
        radius: 180,
        age: 0,
        maxAge: 40,
      })
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

    // Main Hydrodynamic Physics & Rendering Loop
    const render = () => {
      time += 0.018
      ctx.clearRect(0, 0, width, height)

      const mouse = mouseRef.current
      mouse.vx *= 0.94
      mouse.vy *= 0.94
      mouse.speed *= 0.94

      // Update vortices (eddies)
      for (let v = vortices.length - 1; v >= 0; v--) {
        const vortex = vortices[v]
        vortex.age++
        vortex.x += vortex.vx
        vortex.y += vortex.vy
        vortex.vx *= 0.96
        vortex.vy *= 0.96
        vortex.strength *= 0.96

        if (vortex.age >= vortex.maxAge || Math.abs(vortex.strength) < 0.05) {
          vortices.splice(v, 1)
        }
      }

      const influenceRadius = 160
      const influenceRadiusSq = influenceRadius * influenceRadius

      // Update fluid particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]

        // 1. Organic Navier-Stokes ambient harmonic currents (Lusion deep drift)
        const waveX =
          Math.sin(time * 0.8 + p.originY * 0.008 + p.originX * 0.004) * 2.2 +
          Math.sin(time * 1.4 + p.originX * 0.01) * 1.0
        const waveY =
          Math.cos(time * 0.8 + p.originX * 0.008 + p.originY * 0.004) * 2.2 +
          Math.cos(time * 1.2 + p.originY * 0.01) * 1.0

        // 2. Direct cursor pressure & momentum injection
        if (mouse.active) {
          const dx = p.x - mouse.x
          const dy = p.y - mouse.y
          const distSq = dx * dx + dy * dy

          if (distSq < influenceRadiusSq) {
            const dist = Math.sqrt(distSq)
            const factor = (1 - dist / influenceRadius)
            const angle = Math.atan2(dy, dx)

            // Dynamic fluid displacement & viscous shear
            const push = factor * factor * (mouse.down ? 7.0 : 4.2)
            p.vx += Math.cos(angle) * push + mouse.vx * factor * 0.45
            p.vy += Math.sin(angle) * push + mouse.vy * factor * 0.45

            // Spin & expansion
            p.spin += factor * 0.1
            p.colorAlpha = Math.min(p.colorAlpha + factor * 0.25, 0.45)
          }
        }

        // 3. Apply active fluid vortices (swirling eddies)
        for (let v = 0; v < vortices.length; v++) {
          const vortex = vortices[v]
          const vdx = p.x - vortex.x
          const vdy = p.y - vortex.y
          const vdistSq = vdx * vdx + vdy * vdy
          const vRadSq = vortex.radius * vortex.radius

          if (vdistSq < vRadSq && vdistSq > 1) {
            const vdist = Math.sqrt(vdistSq)
            const vFactor = (1 - vdist / vortex.radius) * (1 - vortex.age / vortex.maxAge)
            const perpAngle = Math.atan2(vdy, vdx) + Math.PI / 2

            // Swirl velocity around vortex center
            const swirlForce = vortex.strength * vFactor * 3.5
            p.vx += Math.cos(perpAngle) * swirlForce
            p.vy += Math.sin(perpAngle) * swirlForce
            p.colorAlpha = Math.min(p.colorAlpha + vFactor * 0.3, 0.5)
          }
        }

        // 4. Hydrodynamic spring restoration with viscosity damping
        const targetX = p.originX + waveX
        const targetY = p.originY + waveY

        const restoreForceX = (targetX - p.x) * 0.04
        const restoreForceY = (targetY - p.y) * 0.04

        p.vx = (p.vx + restoreForceX / p.mass) * 0.89
        p.vy = (p.vy + restoreForceY / p.mass) * 0.89

        p.x += p.vx
        p.y += p.vy

        // Alpha decay back to ambient
        p.colorAlpha += (0.045 - p.colorAlpha) * 0.04
      }

      // 5. Draw fluid interconnecting mesh tension ribbons (Lusion liquid membrane)
      const baseAlpha = isDark ? 0.03 : 0.025
      const activeLineAlpha = isDark ? 0.15 : 0.12

      ctx.lineWidth = 0.8
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i]
        const vel1 = Math.sqrt(p1.vx * p1.vx + p1.vy * p1.vy)

        // Connect with horizontal neighbor
        if ((i + 1) % cols !== 0 && i + 1 < particles.length) {
          const p2 = particles[i + 1]
          const distSq = (p1.x - p2.x) * (p1.x - p2.x) + (p1.y - p2.y) * (p1.y - p2.y)

          if (distSq < spacing * spacing * 3.2) {
            const vel2 = Math.sqrt(p2.vx * p2.vx + p2.vy * p2.vy)
            const tension = Math.min((vel1 + vel2) * 0.5, 1)

            if (tension > 0.15) {
              ctx.strokeStyle = isDark
                ? `rgba(255, 255, 255, ${baseAlpha + tension * activeLineAlpha})`
                : `rgba(0, 0, 0, ${baseAlpha + tension * activeLineAlpha})`
              ctx.beginPath()
              ctx.moveTo(p1.x, p1.y)
              ctx.lineTo(p2.x, p2.y)
              ctx.stroke()
            }
          }
        }

        // Connect with vertical neighbor
        if (i + cols < particles.length) {
          const p3 = particles[i + cols]
          const distSq = (p1.x - p3.x) * (p1.x - p3.x) + (p1.y - p3.y) * (p1.y - p3.y)

          if (distSq < spacing * spacing * 3.2) {
            const vel3 = Math.sqrt(p3.vx * p3.vx + p3.vy * p3.vy)
            const tension = Math.min((vel1 + vel3) * 0.5, 1)

            if (tension > 0.15) {
              ctx.strokeStyle = isDark
                ? `rgba(255, 255, 255, ${baseAlpha + tension * activeLineAlpha})`
                : `rgba(0, 0, 0, ${baseAlpha + tension * activeLineAlpha})`
              ctx.beginPath()
              ctx.moveTo(p1.x, p1.y)
              ctx.lineTo(p3.x, p3.y)
              ctx.stroke()
            }
          }
        }
      }

      // 6. Draw glowing fluid nodes & particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy)
        const radius = p.baseRadius + Math.min(speed * 0.5, 2.5)

        ctx.beginPath()
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2)

        if (speed > 0.3) {
          const glowAlpha = Math.min(0.12 + speed * 0.08, 0.4)
          ctx.fillStyle = isDark
            ? `rgba(255, 255, 255, ${glowAlpha})`
            : `rgba(0, 0, 0, ${glowAlpha})`
        } else {
          ctx.fillStyle = isDark
            ? `rgba(255, 255, 255, ${p.colorAlpha})`
            : `rgba(0, 0, 0, ${p.colorAlpha})`
        }
        ctx.fill()
      }

      // 7. Ambient cursor fluid wake aura (Lusion liquid spotlight glow)
      if (mouse.active && mouse.x > 0) {
        const radialGradient = ctx.createRadialGradient(
          mouse.x,
          mouse.y,
          0,
          mouse.x,
          mouse.y,
          180
        )
        if (isDark) {
          radialGradient.addColorStop(0, 'rgba(255, 255, 255, 0.055)')
          radialGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.015)')
          radialGradient.addColorStop(1, 'rgba(255, 255, 255, 0.0)')
        } else {
          radialGradient.addColorStop(0, 'rgba(0, 0, 0, 0.045)')
          radialGradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.012)')
          radialGradient.addColorStop(1, 'rgba(0, 0, 0, 0.0)')
        }

        ctx.fillStyle = radialGradient
        ctx.beginPath()
        ctx.arc(mouse.x, mouse.y, 180, 0, Math.PI * 2)
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
      className="fixed inset-0 pointer-events-none z-0 opacity-90 transition-opacity duration-300"
      aria-hidden="true"
    />
  )
}
