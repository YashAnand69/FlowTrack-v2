'use client'

import React, { useEffect, useState, useRef } from 'react'
import { motion, useSpring, useMotionValue, useReducedMotion } from 'framer-motion'
import { useTheme } from '@/lib/context/ThemeContext'

export function FluidCursor() {
  const { theme } = useTheme()
  const shouldReduceMotion = useReducedMotion()
  const isDark = theme === 'dark'

  const [isVisible, setIsVisible] = useState(false)
  const [isHoveredInteractive, setIsHoveredInteractive] = useState(false)
  const [isClicking, setIsClicking] = useState(false)

  const cursorX = useMotionValue(-100)
  const cursorY = useMotionValue(-100)
  const angle = useMotionValue(0)
  const scaleStretch = useMotionValue(1)

  // Butter-smooth spring tracking
  const springConfig = { damping: 28, stiffness: 450, mass: 0.4 }
  const smoothX = useSpring(cursorX, springConfig)
  const smoothY = useSpring(cursorY, springConfig)

  const lastPos = useRef({ x: -100, y: -100, time: Date.now() })

  useEffect(() => {
    // Only enable custom fluid follower on fine pointer (mouse/trackpad), not touch screens
    if (typeof window === 'undefined' || window.matchMedia('(pointer: coarse)').matches) {
      return
    }

    const handleMouseMove = (e: MouseEvent) => {
      setIsVisible(true)

      const now = Date.now()
      const dt = Math.max(now - lastPos.current.time, 1)
      const dx = e.clientX - lastPos.current.x
      const dy = e.clientY - lastPos.current.y
      const speed = Math.sqrt(dx * dx + dy * dy) / dt

      cursorX.set(e.clientX)
      cursorY.set(e.clientY)

      // Fluid deformation along motion angle
      if (speed > 0.15) {
        const rad = Math.atan2(dy, dx)
        angle.set(rad * (180 / Math.PI))
        // Elongate based on speed (mercury / liquid drop effect)
        const stretch = Math.min(1 + speed * 0.45, 1.6)
        scaleStretch.set(stretch)
      } else {
        scaleStretch.set(1)
      }

      lastPos.current = { x: e.clientX, y: e.clientY, time: now }

      // Check if hovering interactive element
      const target = e.target as HTMLElement
      if (target && target.closest('button, a, input, select, textarea, [role="button"], tr.cursor-pointer')) {
        setIsHoveredInteractive(true)
      } else {
        setIsHoveredInteractive(false)
      }
    }

    const handleMouseDown = () => setIsClicking(true)
    const handleMouseUp = () => setIsClicking(false)
    const handleMouseLeave = () => setIsVisible(false)

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mouseup', handleMouseUp)
    document.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [cursorX, cursorY, angle, scaleStretch])

  if (shouldReduceMotion || !isVisible) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden hidden md:block">
      <motion.div
        style={{
          x: smoothX,
          y: smoothY,
          translateX: '-50%',
          translateY: '-50%',
          rotate: angle,
          scaleX: scaleStretch,
        }}
        animate={{
          scale: isClicking ? 0.75 : isHoveredInteractive ? 1.5 : 1,
          opacity: isVisible ? 1 : 0,
        }}
        transition={{
          type: 'spring',
          stiffness: 500,
          damping: 28,
        }}
        className="w-7 h-7 rounded-full border border-zinc-950/20 dark:border-white/30 backdrop-blur-[2px] shadow-[0_0_12px_rgba(255,255,255,0.1)] flex items-center justify-center"
      >
        <div
          className={`w-1.5 h-1.5 rounded-full transition-transform duration-150 ${
            isDark ? 'bg-white shadow-[0_0_6px_rgba(255,255,255,0.8)]' : 'bg-zinc-950 shadow-[0_0_6px_rgba(0,0,0,0.5)]'
          }`}
        />
      </motion.div>
    </div>
  )
}
