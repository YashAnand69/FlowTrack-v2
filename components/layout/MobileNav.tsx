'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence, useReducedMotion, type Transition } from 'framer-motion'
import {
  Menu,
  X,
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  Plus,
  Moon,
  Sun,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { useTheme } from '@/lib/context/ThemeContext'
import { useAuth } from '@/lib/context/AuthContext'

interface MobileNavProps {
  onOpenInvoiceModal?: () => void
}

export function MobileNav({ onOpenInvoiceModal }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const { theme, toggleTheme } = useTheme()
  const { signOut, profile } = useAuth()
  const shouldReduceMotion = useReducedMotion()

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Invoices', href: '/invoices', icon: FileText },
    { label: 'Clients', href: '/clients', icon: Users },
    { label: 'Settings', href: '/settings', icon: Settings },
  ]

  const springTransition: Transition = shouldReduceMotion
    ? { duration: 0 }
    : { type: 'spring', stiffness: 380, damping: 30 }

  const closeMenu = () => setIsOpen(false)

  return (
    <div className="md:hidden sticky top-0 z-40 bg-white/80 dark:bg-[#09090b]/85 backdrop-blur-2xl border-b border-zinc-200/80 dark:border-white/[0.08] px-4 h-16 flex items-center justify-between shadow-[inset_0_-1px_0_rgba(0,0,0,0.03)] dark:shadow-[inset_0_-1px_0_rgba(255,255,255,0.04)]">
      {/* Brand */}
      <Link href="/dashboard" className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 flex items-center justify-center font-bold text-xs shadow-sm">
          <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        </div>
        <span className="font-bold text-base tracking-tight text-zinc-950 dark:text-white">
          FlowTrack
        </span>
      </Link>

      {/* Right controls */}
      <div className="flex items-center gap-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleTheme}
          className="p-2 rounded-xl text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-white" />
          ) : (
            <Moon className="w-4 h-4 text-zinc-900" />
          )}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-xl text-zinc-700 dark:text-zinc-300 hover:bg-black/5 dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
          aria-label="Toggle navigation drawer"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </motion.button>
      </div>

      {/* Drawer Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 top-16 z-50 bg-black/60 backdrop-blur-md flex flex-col justify-start"
            onClick={closeMenu}
          >
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={springTransition}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-[#101014] border-b border-zinc-200 dark:border-white/[0.08] p-5 space-y-4 shadow-2xl backdrop-blur-2xl"
            >
              {/* Quick Action */}
              {onOpenInvoiceModal && (
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    closeMenu()
                    onOpenInvoiceModal()
                  }}
                  className="w-full h-11 flex items-center justify-center gap-2 rounded-xl bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 font-semibold text-xs tracking-tight shadow-sm cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Invoice</span>
                </motion.button>
              )}

              {/* Links with Morphing Indicator */}
              <nav className="space-y-1.5 relative">
                {navItems.map((item) => {
                  const isActive = pathname === item.href
                  const Icon = item.icon

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={closeMenu}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-tight transition-colors relative',
                        isActive
                          ? 'text-zinc-950 dark:text-white'
                          : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-black/[0.03] dark:hover:bg-white/[0.04]'
                      )}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activeMobileNavIndicator"
                          transition={springTransition}
                          className="absolute inset-0 rounded-xl bg-black/[0.06] dark:bg-white/[0.1] border border-black/10 dark:border-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]"
                        />
                      )}

                      <Icon
                        className={cn(
                          'w-4 h-4 relative z-10 transition-colors',
                          isActive
                            ? 'text-zinc-950 dark:text-white'
                            : 'text-zinc-400'
                        )}
                      />
                      <span className="relative z-10">{item.label}</span>
                    </Link>
                  )
                })}
              </nav>

              {/* User & Sign Out */}
              <div className="pt-3 border-t border-zinc-200 dark:border-white/[0.06] flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-zinc-900 dark:text-white">
                    {profile?.business_name || 'Rivera Design Studio'}
                  </p>
                  <p className="text-[10px] text-zinc-400">
                    {profile?.business_email || 'alex@riveradesign.co'}
                  </p>
                </div>

                <button
                  onClick={() => {
                    closeMenu()
                    signOut()
                  }}
                  className="inline-flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 font-semibold py-1.5 px-3 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
