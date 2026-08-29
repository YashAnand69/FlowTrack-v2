'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence, useReducedMotion, type Transition } from 'framer-motion'
import {
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  Plus,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface SidebarProps {
  onOpenInvoiceModal?: () => void
}

export function Sidebar({ onOpenInvoiceModal }: SidebarProps) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const shouldReduceMotion = useReducedMotion()

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Invoices', href: '/invoices', icon: FileText },
    { label: 'Clients', href: '/clients', icon: Users },
    { label: 'Settings', href: '/settings', icon: Settings },
  ]

  const springTransition: Transition = shouldReduceMotion
    ? { duration: 0 }
    : { type: 'spring', stiffness: 380, damping: 30, mass: 0.8 }

  const collapseSpring: Transition = shouldReduceMotion
    ? { duration: 0 }
    : { type: 'spring', stiffness: 320, damping: 32 }

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 76 : 256 }}
      transition={collapseSpring}
      className="hidden md:flex flex-col fixed top-0 left-0 h-screen z-30 bg-white/70 dark:bg-[#09090b]/80 backdrop-blur-2xl border-r border-zinc-200/80 dark:border-white/[0.08] text-zinc-900 dark:text-zinc-100 overflow-hidden shadow-[inset_-1px_0_0_rgba(0,0,0,0.03)] dark:shadow-[inset_-1px_0_0_rgba(255,255,255,0.04)] select-none"
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-zinc-200/60 dark:border-white/[0.06] relative z-10">
        <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden group">
          <motion.div
            whileHover={{ scale: 1.06, rotate: -2 }}
            whileTap={{ scale: 0.94 }}
            transition={springTransition}
            className="w-9 h-9 rounded-xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 flex items-center justify-center shrink-0 shadow-[0_2px_10px_rgba(0,0,0,0.15)] dark:shadow-[0_0_20px_rgba(255,255,255,0.2)]"
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </motion.div>

          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
                className="flex flex-col whitespace-nowrap"
              >
                <span className="font-bold text-sm tracking-tight text-zinc-950 dark:text-white">
                  FlowTrack
                </span>
                <span className="text-[10px] text-zinc-400 font-mono tracking-wider uppercase">
                  Studio Edition
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </Link>

        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-white/[0.06] transition-colors relative z-10 cursor-pointer"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </motion.button>
      </div>

      {/* Quick Action Button */}
      <div className="p-3 relative z-10">
        {onOpenInvoiceModal ? (
          <motion.button
            whileHover={shouldReduceMotion ? {} : { scale: 1.02 }}
            whileTap={shouldReduceMotion ? {} : { scale: 0.97 }}
            transition={springTransition}
            onClick={onOpenInvoiceModal}
            className={cn(
              'w-full flex items-center justify-center font-semibold rounded-xl bg-zinc-950 text-white hover:bg-zinc-900 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100 shadow-[0_2px_12px_rgba(0,0,0,0.1)] dark:shadow-[0_0_24px_rgba(255,255,255,0.15),inset_0_1px_0_rgba(255,255,255,0.9)] transition-colors cursor-pointer',
              isCollapsed ? 'h-10 p-0' : 'h-10 px-4 gap-2 text-xs tracking-tight'
            )}
            title="Create Invoice"
          >
            <Plus className="w-4 h-4" />
            {!isCollapsed && <span>New Invoice</span>}
          </motion.button>
        ) : (
          <Link href="/invoices?create=true">
            <motion.div
              whileHover={shouldReduceMotion ? {} : { scale: 1.02 }}
              whileTap={shouldReduceMotion ? {} : { scale: 0.97 }}
              transition={springTransition}
              className={cn(
                'w-full flex items-center justify-center font-semibold rounded-xl bg-zinc-950 text-white hover:bg-zinc-900 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100 shadow-[0_2px_12px_rgba(0,0,0,0.1)] dark:shadow-[0_0_24px_rgba(255,255,255,0.15),inset_0_1px_0_rgba(255,255,255,0.9)] transition-colors cursor-pointer',
                isCollapsed ? 'h-10 p-0' : 'h-10 px-4 gap-2 text-xs tracking-tight'
              )}
              title="Create Invoice"
            >
              <Plus className="w-4 h-4" />
              {!isCollapsed && <span>New Invoice</span>}
            </motion.div>
          </Link>
        )}
      </div>

      {/* Navigation Links with Monochrome Fluid Sliding Indicator */}
      <nav
        className="flex-1 px-3 py-2 space-y-1.5 relative z-10"
        onMouseLeave={() => setHoveredItem(null)}
      >
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
          const isHovered = hoveredItem === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              onMouseEnter={() => setHoveredItem(item.href)}
              className={cn(
                'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-tight transition-colors duration-150 relative group select-none',
                isActive
                  ? 'text-zinc-950 dark:text-white'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              )}
              title={isCollapsed ? item.label : undefined}
            >
              {/* Active Morphing Sliding Pill Indicator (Monochrome Contrast) */}
              {isActive && (
                <motion.div
                  layoutId="activeNavIndicator"
                  transition={springTransition}
                  className="absolute inset-0 rounded-xl bg-black/[0.06] dark:bg-white/[0.1] border border-black/10 dark:border-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_4px_16px_rgba(0,0,0,0.06)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_0_20px_rgba(255,255,255,0.08)] backdrop-blur-md"
                />
              )}

              {/* Hover Preview Highlight */}
              {!isActive && isHovered && (
                <motion.div
                  layoutId="hoverNavHighlight"
                  transition={springTransition}
                  className="absolute inset-0 rounded-xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/5 dark:border-white/[0.05]"
                />
              )}

              {/* Reactive Icon */}
              <motion.div
                animate={{
                  scale: isActive ? 1.08 : 1,
                }}
                transition={springTransition}
                className="relative z-10 shrink-0"
              >
                <Icon
                  className={cn(
                    'w-4 h-4 transition-all duration-200',
                    isActive
                      ? 'text-zinc-950 dark:text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.4)]'
                      : 'text-zinc-400 group-hover:text-zinc-800 dark:group-hover:text-zinc-200'
                  )}
                />
              </motion.div>

              {/* Nav Item Label */}
              {!isCollapsed && (
                <span className="relative z-10 whitespace-nowrap font-medium text-xs">
                  {item.label}
                </span>
              )}

              {/* Active Right Micro Dot */}
              {isActive && !isCollapsed && (
                <motion.div
                  layoutId="activeNavDot"
                  transition={springTransition}
                  className="ml-auto relative z-10 w-1.5 h-1.5 rounded-full bg-zinc-950 dark:bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Fluid Monochrome Pro Badge */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            transition={{ duration: 0.2 }}
            className="p-3.5 m-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.04] border border-zinc-200 dark:border-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-xl relative z-10"
          >
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-900 dark:text-white">
              <Sparkles className="w-3.5 h-3.5 text-zinc-950 dark:text-white" />
              <span>Fluid Architecture</span>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed font-normal">
              Bespoke spring dynamics and responsive fluid field.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.aside>
  )
}
