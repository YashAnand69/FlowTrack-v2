import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/lib/context/ThemeContext'
import { ToastProvider } from '@/lib/context/ToastContext'
import { AuthProvider } from '@/lib/context/AuthContext'
import { FluidDynamicsCanvas } from '@/components/ui/FluidDynamicsCanvas'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'FlowTrack — Fluid Monochrome Invoice & Client Studio',
  description:
    'A high-performance, fluid invoice and client tracker designed with tactile spring physics, monochrome minimalism, and real-time ledger mechanics.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className="min-h-screen bg-[#fbfbfb] dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 antialiased selection:bg-zinc-950 selection:text-white dark:selection:bg-white dark:selection:text-zinc-950 relative overflow-x-hidden">
        <ThemeProvider>
          <ToastProvider>
            <AuthProvider>
              {/* Interactive Fluid Dynamics Particle Mesh Canvas */}
              <FluidDynamicsCanvas />

              {/* Main App Content */}
              <div className="relative z-10">{children}</div>
            </AuthProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
