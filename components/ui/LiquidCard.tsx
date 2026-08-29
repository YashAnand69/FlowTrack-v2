'use client'

import React, { useRef, useState } from 'react'
import { motion, useReducedMotion, useSpring, useMotionValue, useTransform } from 'framer-motion'
import { cn } from '@/lib/utils/cn'

interface LiquidCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
  tiltStrength?: number
  glareOpacity?: number
}

export function LiquidCard({
  children,
  className = '',
  tiltStrength = 8,
  glareOpacity = 0.08,
  ...props
}: LiquidCardProps) {
  const cardRef = useRef<HTMLDivElement | null>(null)
  const shouldReduceMotion = useReducedMotion()

  const [isHovered, setIsHovered] = useState(false)

  // Spring values for 3D rotation & spotlight
  const mouseX = useMotionValue(0.5)
  const mouseY = useMotionValue(0.5)

  const springConfig = { stiffness: 350, damping: 25, mass: 0.5 }
  const smoothX = useSpring(mouseX, springConfig)
  const smoothY = useSpring(mouseY, springConfig)

  const rotateX = useTransform(smoothY, [0, 1], [tiltStrength, -tiltStrength])
  const rotateY = useTransform(smoothX, [0, 1], [-tiltStrength, tiltStrength])
  const spotlightX = useTransform(smoothX, [0, 1], ['0%', '100%'])
  const spotlightY = useTransform(smoothY, [0, 1], ['0%', '100%'])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (shouldReduceMotion || !cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    mouseX.set(x)
    mouseY.set(y)
  }

  const handleMouseEnter = () => {
    setIsHovered(true)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    mouseX.set(0.5)
    mouseY.set(0.5)
  }

  if (shouldReduceMotion) {
    return (
      <div className={cn('glass-card rounded-2xl p-6 relative', className)} {...props}>
        {children}
      </div>
    )
  }

  return (
    <div style={{ perspective: '1200px' }} className="w-full">
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        whileHover={{ scale: 1.012, y: -2 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className={cn(
          'glass-card rounded-2xl relative overflow-hidden transition-colors duration-200',
          className
        )}
        {...(props as any)}
      >
        {/* Dynamic Specular Liquid Glare Spotlight */}
        <motion.div
          className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-300 z-10"
          style={{
            opacity: isHovered ? 1 : 0,
            background: useTransform(
              [spotlightX, spotlightY],
              ([x, y]) =>
                `radial-gradient(400px circle at ${x} ${y}, rgba(255,255,255,${glareOpacity}), transparent 70%)`
            ),
          }}
        />

        {/* Content with subtle parallax depth */}
        <div style={{ transform: 'translateZ(12px)' }} className="relative z-0">
          {children}
        </div>
      </motion.div>
    </div>
  )
}
