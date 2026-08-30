'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { audioEngine } from '@/lib/utils/audio-engine'

interface AudioContextType {
  isBgmPlaying: boolean
  toggleBgm: () => void
  playHover: () => void
  playClick: () => void
  playSuccess: () => void
  playChime: (isDark?: boolean) => void
}

const AudioContext = createContext<AudioContextType>({
  isBgmPlaying: false,
  toggleBgm: () => {},
  playHover: () => {},
  playClick: () => {},
  playSuccess: () => {},
  playChime: () => {},
})

const BGM_STORAGE_KEY = 'flowtrack_bgm_active'

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [isBgmPlaying, setIsBgmPlaying] = useState(false)

  useEffect(() => {
    // Subscribe to engine state
    const unsubscribe = audioEngine.subscribeBGM((playing) => {
      setIsBgmPlaying(playing)
    })

    // Check saved preference on client
    try {
      const saved = localStorage.getItem(BGM_STORAGE_KEY)
      if (saved === 'true') {
        // Auto-play on first click anywhere on page (browser policy allows audio after first user gesture)
        const handleFirstInteraction = () => {
          audioEngine.startBGM()
          window.removeEventListener('pointerdown', handleFirstInteraction)
          window.removeEventListener('keydown', handleFirstInteraction)
        }
        window.addEventListener('pointerdown', handleFirstInteraction, { once: true })
        window.addEventListener('keydown', handleFirstInteraction, { once: true })
      }
    } catch {}

    return () => {
      unsubscribe()
    }
  }, [])

  const toggleBgm = () => {
    const newState = audioEngine.toggleBGM()
    setIsBgmPlaying(newState)
    try {
      localStorage.setItem(BGM_STORAGE_KEY, String(newState))
    } catch {}
  }

  return (
    <AudioContext.Provider
      value={{
        isBgmPlaying,
        toggleBgm,
        playHover: () => audioEngine.playHover(),
        playClick: () => audioEngine.playClick(),
        playSuccess: () => audioEngine.playSuccess(),
        playChime: (isDark?: boolean) => audioEngine.playChime(isDark),
      }}
    >
      {children}
    </AudioContext.Provider>
  )
}

export function useAudio() {
  return useContext(AudioContext)
}
