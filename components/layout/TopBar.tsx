'use client'

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Sun,
  Moon,
  Search,
  Plus,
  Settings,
  LogOut,
  Database,
  Building2,
  Flame,
  Command,
  Volume2,
  VolumeX,
} from 'lucide-react'
import { useTheme } from '@/lib/context/ThemeContext'
import { useAuth } from '@/lib/context/AuthContext'
import { useAudio } from '@/lib/context/AudioContext'
import { isFirebaseConfigured } from '@/lib/firebase/config'
import { isSupabaseConfigured } from '@/lib/supabase/client'
import { soundEngine } from '@/lib/utils/haptics'

interface TopBarProps {
  onOpenInvoiceModal?: () => void
  onOpenClientModal?: () => void
  onOpenCommandPalette?: () => void
  onSearch?: (query: string) => void
}

export function TopBar({
  onOpenInvoiceModal,
  onOpenClientModal,
  onOpenCommandPalette,
  onSearch,
}: TopBarProps) {
  const { theme, toggleTheme } = useTheme()
  const { user, profile, signOut } = useAuth()
  const { isBgmPlaying, toggleBgm } = useAudio()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const businessName = profile?.business_name || 'Rivera Design Studio'
  const userEmail = user?.email || profile?.business_email || 'alex@riveradesign.co'
  const initials = businessName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const backendLabel = isFirebaseConfigured
    ? 'Firebase Firestore'
    : isSupabaseConfigured
    ? 'Supabase PostgreSQL'
    : 'Local Storage Engine'

  return (
    <header className="h-16 sticky top-0 z-20 bg-white/70 dark:bg-[#09090b]/80 backdrop-blur-2xl border-b border-zinc-200/80 dark:border-white/[0.08] px-4 sm:px-8 flex items-center justify-between gap-4 transition-colors duration-200 shadow-[inset_0_-1px_0_rgba(0,0,0,0.03)] dark:shadow-[inset_0_-1px_0_rgba(255,255,255,0.04)]">
      {/* Search Bar / Command Palette Trigger */}
      <div className="flex-1 max-w-md relative hidden sm:block">
        <button
          type="button"
          onClick={() => {
            soundEngine.playClick()
            if (onOpenCommandPalette) onOpenCommandPalette()
          }}
          className="w-full h-9 pl-9 pr-12 text-xs rounded-xl border border-zinc-200/80 dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.03] hover:bg-black/[0.04] dark:hover:bg-white/[0.06] text-zinc-500 dark:text-zinc-400 flex items-center justify-between transition-all font-medium text-left cursor-pointer group"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3.5 pointer-events-none group-hover:text-zinc-950 dark:group-hover:text-white transition-colors" />
            <span className="truncate">Search commands, invoices, clients...</span>
          </div>
          <kbd className="absolute right-2.5 px-1.5 py-0.5 text-[10px] font-mono text-zinc-400 dark:text-zinc-500 bg-white/80 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/60 rounded pointer-events-none flex items-center gap-0.5">
            <span>⌘</span>K
          </kbd>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3 ml-auto">
        {/* Ambient Soundscape BGM Toggle Button with Animated Equalizer */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => {
            soundEngine.playClick()
            toggleBgm()
          }}
          className={`flex items-center gap-2 px-2.5 py-1.5 text-xs font-mono font-medium rounded-xl border transition-all cursor-pointer ${
            isBgmPlaying
              ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 border-zinc-950 dark:border-white shadow-xs'
              : 'bg-black/[0.02] dark:bg-white/[0.03] text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border-zinc-200/80 dark:border-white/[0.08]'
          }`}
          title={isBgmPlaying ? 'Pause Ambient Soundscape' : 'Play Soothing Ambient Soundscape'}
          aria-label={isBgmPlaying ? 'Pause Ambient Soundscape' : 'Play Soothing Ambient Soundscape'}
        >
          {isBgmPlaying ? (
            <div className="flex items-end gap-[2px] h-3.5 w-3.5 py-0.5">
              <motion.span
                animate={{ height: ['30%', '100%', '50%', '80%', '30%'] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                className="w-[2px] rounded-full bg-current"
              />
              <motion.span
                animate={{ height: ['80%', '30%', '100%', '40%', '80%'] }}
                transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut' }}
                className="w-[2px] rounded-full bg-current"
              />
              <motion.span
                animate={{ height: ['40%', '90%', '20%', '100%', '40%'] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                className="w-[2px] rounded-full bg-current"
              />
            </div>
          ) : (
            <VolumeX className="w-3.5 h-3.5 opacity-70" />
          )}
          <span className="text-[11px] hidden md:inline font-mono tracking-tight">
            {isBgmPlaying ? 'Soundscape On' : 'Ambience'}
          </span>
        </motion.button>

        {/* Quick Command Palette Button for Mobile */}
        {onOpenCommandPalette && (
          <button
            onClick={onOpenCommandPalette}
            className="sm:hidden p-2 rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] cursor-pointer"
            aria-label="Open Command Palette"
          >
            <Command className="w-4 h-4" />
          </button>
        )}

        {onOpenClientModal && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              soundEngine.playClick()
              onOpenClientModal()
            }}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-zinc-800 dark:text-zinc-200 bg-black/[0.04] hover:bg-black/[0.07] dark:bg-white/[0.06] dark:hover:bg-white/[0.1] border border-black/5 dark:border-white/10 rounded-xl transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Client</span>
          </motion.button>
        )}

        {onOpenInvoiceModal && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              soundEngine.playClick()
              onOpenInvoiceModal()
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-zinc-950 hover:bg-zinc-900 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Invoice</span>
          </motion.button>
        )}

        {/* Theme Toggle Button with Haptic Sound */}
        <motion.button
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          onClick={() => {
            soundEngine.playChime(theme === 'dark')
            toggleTheme()
          }}
          className="p-2 rounded-xl text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06] border border-transparent hover:border-black/5 dark:hover:border-white/10 transition-colors cursor-pointer"
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-white" />
          ) : (
            <Moon className="w-4 h-4 text-zinc-900" />
          )}
        </motion.button>

        {/* User Profile Avatar & Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => {
              soundEngine.playClick()
              setIsDropdownOpen(!isDropdownOpen)
            }}
            className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-xl border border-zinc-200/80 dark:border-white/[0.08] bg-white/40 dark:bg-white/[0.02] hover:bg-black/[0.03] dark:hover:bg-white/[0.05] transition-colors cursor-pointer"
            aria-expanded={isDropdownOpen}
            aria-label="User profile menu"
          >
            <div className="w-7 h-7 rounded-lg bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 flex items-center justify-center text-xs font-bold shadow-xs">
              {initials}
            </div>
            <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 max-w-[100px] truncate hidden md:inline-block">
              {businessName}
            </span>
          </button>

          {isDropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              className="absolute right-0 mt-2 w-64 rounded-2xl bg-white/95 dark:bg-[#121216]/95 border border-zinc-200 dark:border-white/[0.1] shadow-2xl backdrop-blur-2xl py-2 z-50 overflow-hidden"
            >
              {/* User Header */}
              <div className="px-4 py-3 border-b border-zinc-100 dark:border-white/[0.06]">
                <p className="text-xs font-bold text-zinc-950 dark:text-white truncate">
                  {businessName}
                </p>
                <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                  {userEmail}
                </p>

                <div className="mt-2.5 flex items-center gap-1.5 text-[10px] font-mono font-medium text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-white/[0.05] px-2 py-1 rounded-md border border-zinc-200/50 dark:border-white/[0.05]">
                  {isFirebaseConfigured ? (
                    <Flame className="w-3 h-3 text-amber-500" />
                  ) : (
                    <Database className="w-3 h-3 text-zinc-900 dark:text-white" />
                  )}
                  <span>{backendLabel}</span>
                </div>
              </div>

              {/* Links */}
              <div className="py-1 text-xs">
                <Link
                  href="/settings"
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-zinc-700 dark:text-zinc-300 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors"
                >
                  <Building2 className="w-4 h-4 text-zinc-400" />
                  <span>Business Profile</span>
                </Link>

                <Link
                  href="/settings"
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-zinc-700 dark:text-zinc-300 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors"
                >
                  <Settings className="w-4 h-4 text-zinc-400" />
                  <span>Preferences & Currency</span>
                </Link>
              </div>

              {/* Sign Out */}
              <div className="pt-1 border-t border-zinc-100 dark:border-white/[0.06]">
                <button
                  onClick={() => {
                    setIsDropdownOpen(false)
                    signOut()
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors text-left cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </header>
  )
}
