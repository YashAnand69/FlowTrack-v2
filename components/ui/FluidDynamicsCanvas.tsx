'use client'

import React, { useEffect, useRef } from 'react'
import { useTheme } from '@/lib/context/ThemeContext'

interface FluidDyeTrail {
  points: Array<{ x: number; y: number; vx: number; vy: number; width: number; alpha: number }>
  life: number
  maxLife: number
  decay: number
}

interface FluidEddy {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  growth: number
  rotation: number
  spinSpeed: number
  strength: number
  life: number
  maxLife: number
  filaments: Array<{ angle: number; length: number; speed: number }>
}

interface HydraulicShockwave {
  x: number
  y: number
  radius: number
  maxRadius: number
  intensity: number
  speed: number
  waveWidth: number
}

interface LiquidSilkSheet {
  points: Array<{
    x: number
    y: number
    vx: number
    vy: number
    mass: number
    pinnedY: number
  }>
  baseY: number
  amplitude: number
  wavelength: number
  frequency: number
  phase: number
  thickness: number
  glowAlpha: number
  specularAlpha: number
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
    pressTime: 0,
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

    // Multi-layer dynamic fluid elements
    const dyeTrails: FluidDyeTrail[] = []
    const eddies: FluidEddy[] = []
    const shockwaves: HydraulicShockwave[] = []

    // 5 Volumetric Liquid Sheets with Specular Crest Highlights (Apple/Lusion liquid metal sheets)
    const sheetCount = 5
    const segments = 32
    const sheets: LiquidSilkSheet[] = []

    for (let i = 0; i < sheetCount; i++) {
      const baseY = height * (0.16 + (i / (sheetCount - 1 || 1)) * 0.72)
      const points = []
      for (let s = 0; s <= segments; s++) {
        const x = (width / segments) * s
        points.push({
          x,
          y: baseY,
          vx: 0,
          vy: 0,
          mass: 0.8 + Math.sin((s / segments) * Math.PI) * 0.4,
          pinnedY: baseY,
        })
      }
      sheets.push({
        points,
        baseY,
        amplitude: 38 + i * 14,
        wavelength: 2.2 + i * 0.4,
        frequency: 0.001 + i * 0.0003,
        phase: i * (Math.PI / 3),
        thickness: 90 + i * 35,
        glowAlpha: isDark ? 0.035 + i * 0.012 : 0.025 + i * 0.008,
        specularAlpha: isDark ? 0.28 + i * 0.08 : 0.18 + i * 0.05,
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

      sheets.forEach((sheet, i) => {
        sheet.baseY = height * (0.16 + (i / (sheetCount - 1 || 1)) * 0.72)
        sheet.points.forEach((p, s) => {
          p.x = (width / segments) * s
          p.pinnedY = sheet.baseY
          p.y = sheet.baseY
        })
      })
    }

    let activeTrail: FluidDyeTrail | null = null

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

      mouse.vx = dx * 0.65
      mouse.vy = dy * 0.65
      mouse.speed = currentSpeed
      mouse.x = currentX
      mouse.y = currentY
      mouse.active = true

      // Dynamic liquid ribbon emission
      if (!activeTrail || activeTrail.points.length > 25) {
        activeTrail = {
          points: [],
          life: 0,
          maxLife: 60,
          decay: 0.965,
        }
        dyeTrails.push(activeTrail)
        if (dyeTrails.length > 18) dyeTrails.shift()
      }

      // Add fluid trail point with hydrodynamic spread
      const ribbonWidth = Math.min(18 + currentSpeed * 1.6, 85)
      activeTrail.points.push({
        x: currentX,
        y: currentY,
        vx: dx * 0.2 + (Math.random() - 0.5) * 1.5,
        vy: dy * 0.2 + (Math.random() - 0.5) * 1.5,
        width: ribbonWidth,
        alpha: isDark ? Math.min(0.35 + currentSpeed * 0.015, 0.75) : Math.min(0.25 + currentSpeed * 0.01, 0.55),
      })

      // Spawn curling Navier-Stokes eddies on rapid sweeps
      if (currentSpeed > 14 && eddies.length < 8) {
        const filaments = []
        for (let f = 0; f < 5; f++) {
          filaments.push({
            angle: (f / 5) * Math.PI * 2,
            length: 25 + Math.random() * 40,
            speed: (Math.random() * 0.06 + 0.03) * (dx > 0 ? 1 : -1),
          })
        }

        eddies.push({
          x: currentX,
          y: currentY,
          vx: dx * 0.18,
          vy: dy * 0.18,
          radius: 20 + currentSpeed * 0.8,
          growth: 0.9,
          rotation: Math.random() * Math.PI * 2,
          spinSpeed: (dx > 0 ? 1 : -1) * (0.04 + Math.min(currentSpeed * 0.003, 0.08)),
          strength: isDark ? 0.45 : 0.32,
          life: 0,
          maxLife: 45 + Math.random() * 20,
          filaments,
        })
      }

      mouse.lastX = currentX
      mouse.lastY = currentY
    }

    const handlePointerDown = (e: PointerEvent | MouseEvent) => {
      mouseRef.current.down = true
      mouseRef.current.pressTime = Date.now()

      // Primary & secondary hydraulic shockwave rings
      shockwaves.push({
        x: e.clientX,
        y: e.clientY,
        radius: 12,
        maxRadius: Math.min(width, height) * 0.55,
        intensity: isDark ? 0.75 : 0.55,
        speed: 10.5,
        waveWidth: 45,
      })

      // Dense fluid burst
      for (let k = 0; k < 6; k++) {
        const angle = (k / 6) * Math.PI * 2
        const burstSpeed = 4.5
        eddies.push({
          x: e.clientX,
          y: e.clientY,
          vx: Math.cos(angle) * burstSpeed,
          vy: Math.sin(angle) * burstSpeed,
          radius: 35,
          growth: 1.2,
          rotation: angle,
          spinSpeed: (k % 2 === 0 ? 1 : -1) * 0.06,
          strength: isDark ? 0.6 : 0.4,
          life: 0,
          maxLife: 50,
          filaments: [
            { angle: 0, length: 45, speed: 0.05 },
            { angle: Math.PI * 0.6, length: 35, speed: -0.05 },
            { angle: Math.PI * 1.3, length: 40, speed: 0.04 },
          ],
        })
      }
    }

    const handlePointerUp = () => {
      mouseRef.current.down = false
    }

    const handlePointerLeave = () => {
      mouseRef.current.active = false
      activeTrail = null
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('pointermove', handlePointerMove, { passive: true })
    window.addEventListener('pointerdown', handlePointerDown)
    window.addEventListener('pointerup', handlePointerUp)
    document.addEventListener('pointerleave', handlePointerLeave)

    let time = 0

    // Master 60FPS Fluid Dynamics Engine
    const render = () => {
      time += 0.016
      ctx.clearRect(0, 0, width, height)

      const mouse = mouseRef.current
      mouse.vx *= 0.91
      mouse.vy *= 0.91
      mouse.speed *= 0.91

      // ======================================================================
      // 1. VOLUMETRIC LIQUID SILK SHEETS WITH SPECULAR CREST LIGHTING
      // ======================================================================
      for (let i = 0; i < sheets.length; i++) {
        const sheet = sheets[i]
        const points = sheet.points

        // Multi-frequency harmonic liquid wave physics with hydrodynamic drag
        for (let s = 0; s < points.length; s++) {
          const p = points[s]
          const normX = p.x / width

          // Complex multi-octave harmonic fluid motion
          const wave1 = Math.sin(time * 0.85 + normX * sheet.wavelength * 3.5 + sheet.phase) * sheet.amplitude
          const wave2 = Math.sin(time * 1.7 + normX * 7.5 + sheet.phase * 1.5) * (sheet.amplitude * 0.4)
          const wave3 = Math.cos(time * 0.45 + normX * 1.8) * (sheet.amplitude * 0.6)
          const wave = wave1 + wave2 + wave3

          // Direct hydrodynamic displacement from pointer momentum & shockwaves
          if (mouse.active) {
            const dx = p.x - mouse.x
            const dy = p.y - mouse.y
            const dist = Math.sqrt(dx * dx + dy * dy)
            const influence = 240

            if (dist < influence) {
              const factor = Math.pow(1 - dist / influence, 2) * (mouse.down ? 65 : 36)
              const angle = Math.atan2(dy, dx)
              p.vx += (Math.cos(angle) * factor * 0.25 + mouse.vx * factor * 0.1) / p.mass
              p.vy += (Math.sin(angle) * factor * 0.25 + mouse.vy * factor * 0.1) / p.mass
            }
          }

          // Shockwave displacement
          for (let w = 0; w < shockwaves.length; w++) {
            const sw = shockwaves[w]
            const sdx = p.x - sw.x
            const sdy = p.y - sw.y
            const sdist = Math.sqrt(sdx * sdx + sdy * sdy)
            const ringDiff = Math.abs(sdist - sw.radius)

            if (ringDiff < sw.waveWidth) {
              const wavePower = (1 - ringDiff / sw.waveWidth) * sw.intensity * 25
              const sAngle = Math.atan2(sdy, sdx)
              p.vy += Math.sin(sAngle) * wavePower * 0.3
            }
          }

          // Viscous hydrodynamic damping & spring restoration
          const targetY = sheet.baseY + wave
          const forceY = (targetY - p.y) * 0.05
          p.vy = (p.vy + forceY / p.mass) * 0.87
          p.vx *= 0.87

          p.y += p.vy
          p.x += p.vx
        }

        // Draw Continuous Liquid Silk Sheet Body
        ctx.beginPath()
        ctx.moveTo(points[0].x, points[0].y - sheet.thickness * 0.5)

        // Top contour (Smooth Bézier spine)
        for (let s = 0; s < points.length - 1; s++) {
          const p0 = points[s]
          const p1 = points[s + 1]
          const mx = (p0.x + p1.x) * 0.5
          const my = (p0.y + p1.y) * 0.5 - sheet.thickness * 0.5
          ctx.quadraticCurveTo(p0.x, p0.y - sheet.thickness * 0.5, mx, my)
        }
        const lastP = points[points.length - 1]
        ctx.lineTo(lastP.x, lastP.y - sheet.thickness * 0.5)

        // Bottom contour (Reverse smooth Bézier spine)
        ctx.lineTo(lastP.x, lastP.y + sheet.thickness * 0.5)
        for (let s = points.length - 1; s > 0; s--) {
          const p0 = points[s]
          const p1 = points[s - 1]
          const mx = (p0.x + p1.x) * 0.5
          const my = (p0.y + p1.y) * 0.5 + sheet.thickness * 0.5
          ctx.quadraticCurveTo(p0.x, p0.y + sheet.thickness * 0.5, mx, my)
        }
        ctx.lineTo(points[0].x, points[0].y + sheet.thickness * 0.5)
        ctx.closePath()

        // Volumetric liquid sheen gradient
        const sheetGrad = ctx.createLinearGradient(
          0,
          sheet.baseY - sheet.thickness,
          0,
          sheet.baseY + sheet.thickness
        )
        if (isDark) {
          sheetGrad.addColorStop(0, 'rgba(255, 255, 255, 0)')
          sheetGrad.addColorStop(0.3, `rgba(255, 255, 255, ${sheet.glowAlpha * 0.6})`)
          sheetGrad.addColorStop(0.5, `rgba(255, 255, 255, ${sheet.glowAlpha * 1.4})`)
          sheetGrad.addColorStop(0.7, `rgba(255, 255, 255, ${sheet.glowAlpha * 0.6})`)
          sheetGrad.addColorStop(1, 'rgba(255, 255, 255, 0)')
        } else {
          sheetGrad.addColorStop(0, 'rgba(0, 0, 0, 0)')
          sheetGrad.addColorStop(0.3, `rgba(0, 0, 0, ${sheet.glowAlpha * 0.5})`)
          sheetGrad.addColorStop(0.5, `rgba(0, 0, 0, ${sheet.glowAlpha * 1.2})`)
          sheetGrad.addColorStop(0.7, `rgba(0, 0, 0, ${sheet.glowAlpha * 0.5})`)
          sheetGrad.addColorStop(1, 'rgba(0, 0, 0, 0)')
        }

        ctx.fillStyle = sheetGrad
        ctx.fill()

        // DRAW SPECULAR LIQUID GLASS RIDGE HIGHLIGHT (Apple/Lusion liquid edge refraction)
        ctx.beginPath()
        ctx.moveTo(points[0].x, points[0].y)
        for (let s = 0; s < points.length - 1; s++) {
          const p0 = points[s]
          const p1 = points[s + 1]
          const mx = (p0.x + p1.x) * 0.5
          const my = (p0.y + p1.y) * 0.5
          ctx.quadraticCurveTo(p0.x, p0.y, mx, my)
        }
        ctx.lineTo(lastP.x, lastP.y)

        ctx.strokeStyle = isDark
          ? `rgba(255, 255, 255, ${sheet.specularAlpha * 0.45})`
          : `rgba(0, 0, 0, ${sheet.specularAlpha * 0.35})`
        ctx.lineWidth = 1.2
        ctx.stroke()
      }

      // ======================================================================
      // 2. BUTTERY LIQUID DYE RIBBONS (Continuous smooth brush dynamics)
      // ======================================================================
      for (let t = dyeTrails.length - 1; t >= 0; t--) {
        const trail = dyeTrails[t]
        trail.life++

        if (trail.life >= trail.maxLife || trail.points.length < 2) {
          dyeTrails.splice(t, 1)
          continue
        }

        const pts = trail.points
        const trailProgress = trail.life / trail.maxLife
        const lifeAlpha = 1 - trailProgress

        // Advect points with natural fluid curl
        for (let p = 0; p < pts.length; p++) {
          const pt = pts[p]
          pt.x += pt.vx
          pt.y += pt.vy
          pt.vx *= 0.93
          pt.vy *= 0.93
          pt.width += 0.6 // Natural dye spreading
          pt.alpha *= trail.decay
        }

        // Render multi-segment continuous fluid stroke
        for (let p = 0; p < pts.length - 1; p++) {
          const p0 = pts[p]
          const p1 = pts[p + 1]
          const currentAlpha = p0.alpha * lifeAlpha

          if (currentAlpha <= 0.01) continue

          const strokeGrad = ctx.createRadialGradient(
            (p0.x + p1.x) * 0.5,
            (p0.y + p1.y) * 0.5,
            0,
            (p0.x + p1.x) * 0.5,
            (p0.y + p1.y) * 0.5,
            p0.width
          )

          if (isDark) {
            strokeGrad.addColorStop(0, `rgba(255, 255, 255, ${currentAlpha * 0.85})`)
            strokeGrad.addColorStop(0.4, `rgba(255, 255, 255, ${currentAlpha * 0.4})`)
            strokeGrad.addColorStop(1, 'rgba(255, 255, 255, 0)')
          } else {
            strokeGrad.addColorStop(0, `rgba(0, 0, 0, ${currentAlpha * 0.75})`)
            strokeGrad.addColorStop(0.4, `rgba(0, 0, 0, ${currentAlpha * 0.3})`)
            strokeGrad.addColorStop(1, 'rgba(0, 0, 0, 0)')
          }

          ctx.fillStyle = strokeGrad
          ctx.beginPath()
          ctx.arc((p0.x + p1.x) * 0.5, (p0.y + p1.y) * 0.5, p0.width, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      // ======================================================================
      // 3. NAVIER-STOKES VORTEX EDDIES & SPIRALING FILAMENTS
      // ======================================================================
      for (let e = eddies.length - 1; e >= 0; e--) {
        const eddy = eddies[e]
        eddy.life++
        eddy.radius += eddy.growth
        eddy.rotation += eddy.spinSpeed
        eddy.x += eddy.vx
        eddy.y += eddy.vy
        eddy.vx *= 0.94
        eddy.vy *= 0.94

        const eddyProgress = eddy.life / eddy.maxLife
        const eddyAlpha = (1 - eddyProgress) * eddy.strength

        if (eddyProgress >= 1 || eddyAlpha <= 0.01) {
          eddies.splice(e, 1)
          continue
        }

        // Draw vortex core glow
        const coreGrad = ctx.createRadialGradient(eddy.x, eddy.y, 0, eddy.x, eddy.y, eddy.radius)
        if (isDark) {
          coreGrad.addColorStop(0, `rgba(255, 255, 255, ${eddyAlpha * 0.5})`)
          coreGrad.addColorStop(0.5, `rgba(255, 255, 255, ${eddyAlpha * 0.15})`)
          coreGrad.addColorStop(1, 'rgba(255, 255, 255, 0)')
        } else {
          coreGrad.addColorStop(0, `rgba(0, 0, 0, ${eddyAlpha * 0.4})`)
          coreGrad.addColorStop(0.5, `rgba(0, 0, 0, ${eddyAlpha * 0.12})`)
          coreGrad.addColorStop(1, 'rgba(0, 0, 0, 0)')
        }

        ctx.fillStyle = coreGrad
        ctx.beginPath()
        ctx.arc(eddy.x, eddy.y, eddy.radius, 0, Math.PI * 2)
        ctx.fill()

        // Draw spiraling fluid filaments
        ctx.lineWidth = 1.0
        for (let f = 0; f < eddy.filaments.length; f++) {
          const fil = eddy.filaments[f]
          fil.angle += fil.speed

          const startAngle = eddy.rotation + fil.angle
          const endAngle = startAngle + 1.2

          ctx.beginPath()
          ctx.arc(eddy.x, eddy.y, eddy.radius * 0.7, startAngle, endAngle)
          ctx.strokeStyle = isDark
            ? `rgba(255, 255, 255, ${eddyAlpha * 0.35})`
            : `rgba(0, 0, 0, ${eddyAlpha * 0.25})`
          ctx.stroke()
        }
      }

      // ======================================================================
      // 4. HYDRAULIC REFRACTIVE SHOCKWAVE EXPANSION
      // ======================================================================
      for (let s = shockwaves.length - 1; s >= 0; s--) {
        const sw = shockwaves[s]
        sw.radius += sw.speed
        sw.intensity *= 0.945

        if (sw.radius >= sw.maxRadius || sw.intensity <= 0.01) {
          shockwaves.splice(s, 1)
          continue
        }

        const shockGrad = ctx.createRadialGradient(
          sw.x,
          sw.y,
          Math.max(0, sw.radius - sw.waveWidth),
          sw.x,
          sw.y,
          sw.radius
        )
        if (isDark) {
          shockGrad.addColorStop(0, 'rgba(255, 255, 255, 0)')
          shockGrad.addColorStop(0.7, `rgba(255, 255, 255, ${sw.intensity * 0.5})`)
          shockGrad.addColorStop(0.9, `rgba(255, 255, 255, ${sw.intensity * 0.8})`)
          shockGrad.addColorStop(1, 'rgba(255, 255, 255, 0)')
        } else {
          shockGrad.addColorStop(0, 'rgba(0, 0, 0, 0)')
          shockGrad.addColorStop(0.7, `rgba(0, 0, 0, ${sw.intensity * 0.38})`)
          shockGrad.addColorStop(0.9, `rgba(0, 0, 0, ${sw.intensity * 0.65})`)
          shockGrad.addColorStop(1, 'rgba(0, 0, 0, 0)')
        }

        ctx.fillStyle = shockGrad
        ctx.beginPath()
        ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2)
        ctx.fill()
      }

      // ======================================================================
      // 5. CAUSTIC LIQUID SPOTLIGHT (Subtle cursor ambient glow)
      // ======================================================================
      if (mouse.active && mouse.x > 0) {
        const spotlightRadius = 260 + mouse.speed * 3.2
        const spotGrad = ctx.createRadialGradient(
          mouse.x,
          mouse.y,
          0,
          mouse.x,
          mouse.y,
          spotlightRadius
        )

        if (isDark) {
          spotGrad.addColorStop(0, 'rgba(255, 255, 255, 0.085)')
          spotGrad.addColorStop(0.35, 'rgba(255, 255, 255, 0.03)')
          spotGrad.addColorStop(0.7, 'rgba(255, 255, 255, 0.008)')
          spotGrad.addColorStop(1, 'rgba(255, 255, 255, 0)')
        } else {
          spotGrad.addColorStop(0, 'rgba(0, 0, 0, 0.065)')
          spotGrad.addColorStop(0.35, 'rgba(0, 0, 0, 0.022)')
          spotGrad.addColorStop(0.7, 'rgba(0, 0, 0, 0.005)')
          spotGrad.addColorStop(1, 'rgba(0, 0, 0, 0)')
        }

        ctx.fillStyle = spotGrad
        ctx.beginPath()
        ctx.arc(mouse.x, mouse.y, spotlightRadius, 0, Math.PI * 2)
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
      className="fixed inset-0 pointer-events-none z-[1] opacity-100 transition-opacity duration-300"
      aria-hidden="true"
    />
  )
}
