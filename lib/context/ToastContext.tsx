'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'info'

export interface ToastMessage {
  id: string
  type: ToastType
  title: string
  description?: string
}

interface ToastContextType {
  toast: (options: { type?: ToastType; title: string; description?: string; duration?: number }) => void
  success: (title: string, description?: string) => void
  error: (title: string, description?: string) => void
  info: (title: string, description?: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback(
    ({
      type = 'info',
      title,
      description,
      duration = 3500,
    }: {
      type?: ToastType
      title: string
      description?: string
      duration?: number
    }) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
      const newToast: ToastMessage = { id, type, title, description }

      setToasts((prev) => [...prev, newToast])

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id)
        }, duration)
      }
    },
    [removeToast]
  )

  const success = useCallback(
    (title: string, description?: string) => {
      toast({ type: 'success', title, description })
    },
    [toast]
  )

  const error = useCallback(
    (title: string, description?: string) => {
      toast({ type: 'error', title, description })
    },
    [toast]
  )

  const info = useCallback(
    (title: string, description?: string) => {
      toast({ type: 'info', title, description })
    },
    [toast]
  )

  return (
    <ToastContext.Provider value={{ toast, success, error, info }}>
      {children}
      {/* Toast Notification Container */}
      <div
        aria-live="polite"
        className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0"
      >
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              role="alert"
              className="pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border border-zinc-200 dark:border-white/10 bg-white/95 dark:bg-[#121216]/95 backdrop-blur-2xl shadow-2xl text-zinc-950 dark:text-white"
            >
              {t.type === 'success' && (
                <div className="w-5 h-5 rounded-full bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
              )}
              {t.type === 'error' && (
                <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              )}
              {t.type === 'info' && (
                <Info className="w-5 h-5 text-zinc-400 shrink-0 mt-0.5" />
              )}

              <div className="flex-1 text-xs">
                <p className="font-bold tracking-tight text-zinc-950 dark:text-white">
                  {t.title}
                </p>
                {t.description && (
                  <p className="mt-0.5 text-zinc-500 dark:text-zinc-400 text-[11px] font-mono leading-relaxed">
                    {t.description}
                  </p>
                )}
              </div>

              <button
                onClick={() => removeToast(t.id)}
                className="text-zinc-400 hover:text-zinc-950 dark:hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
                aria-label="Close notification"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
