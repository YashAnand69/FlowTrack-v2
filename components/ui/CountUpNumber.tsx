'use client'

import React, { useEffect, useState } from 'react'

interface CountUpNumberProps {
  value: number
  prefix?: string
  suffix?: string
  decimals?: number
  duration?: number
  className?: string
}

export function CountUpNumber({
  value,
  prefix = '',
  suffix = '',
  decimals = 2,
  duration = 800,
  className = '',
}: CountUpNumberProps) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    let startTimestamp: number | null = null
    const startValue = 0
    const endValue = value

    if (endValue === 0) {
      setDisplayValue(0)
      return
    }

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp
      const progress = Math.min((timestamp - startTimestamp) / duration, 1)
      // Ease-out expo curve for physical snappy count-up
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)
      const current = startValue + (endValue - startValue) * easeProgress

      setDisplayValue(current)

      if (progress < 1) {
        window.requestAnimationFrame(step)
      }
    }

    window.requestAnimationFrame(step)
  }, [value, duration])

  const formatted = decimals > 0
    ? displayValue.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })
    : Math.round(displayValue).toLocaleString('en-US')

  return (
    <span className={`tabular-nums font-mono tracking-tight ${className}`}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  )
}
