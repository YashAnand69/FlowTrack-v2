// ==============================================================================
// FlowTrack Playful & Soothing Generative Ambient Soundscape (Lusion / Cozy Vibe)
// Synthesized natively via Web Audio API (0 external assets, zero latency)
// ==============================================================================

class LusionAudioEngine {
  private ctx: AudioContext | null = null
  private masterGain: GainNode | null = null
  private bgmGain: GainNode | null = null
  private sfxGain: GainNode | null = null

  // Ambient BGM Nodes
  private isBgmActive: boolean = false
  private bgmOscillators: Array<{ osc: OscillatorNode; gain: GainNode }> = []
  private bgmIntervalId: any = null
  private chordIntervalId: any = null
  private bassIntervalId: any = null
  private filterNode: BiquadFilterNode | null = null
  private delayNode: DelayNode | null = null
  private delayFeedback: GainNode | null = null

  // Volume staging
  private bgmVolume: number = 0.52
  private sfxVolume: number = 0.45
  private listeners: Set<(isPlaying: boolean) => void> = new Set()

  constructor() {
    // Lazy init
  }

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null

    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
      if (!AudioCtx) return null

      this.ctx = new AudioCtx()

      // Master output
      this.masterGain = this.ctx.createGain()
      this.masterGain.gain.setValueAtTime(1.0, this.ctx.currentTime)
      this.masterGain.connect(this.ctx.destination)

      // BGM Bus
      this.bgmGain = this.ctx.createGain()
      this.bgmGain.gain.setValueAtTime(0, this.ctx.currentTime)
      this.bgmGain.connect(this.masterGain)

      // SFX Bus
      this.sfxGain = this.ctx.createGain()
      this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime)
      this.sfxGain.connect(this.masterGain)

      // Playful Stereo Delay / Spatial Reverb Bus
      this.delayNode = this.ctx.createDelay()
      this.delayNode.delayTime.setValueAtTime(0.28, this.ctx.currentTime)

      this.delayFeedback = this.ctx.createGain()
      this.delayFeedback.gain.setValueAtTime(0.38, this.ctx.currentTime)

      this.delayNode.connect(this.delayFeedback)
      this.delayFeedback.connect(this.delayNode)
      this.delayNode.connect(this.bgmGain)
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume()
    }

    return this.ctx
  }

  public subscribeBGM(callback: (isPlaying: boolean) => void) {
    this.listeners.add(callback)
    callback(this.isBgmActive)
    return () => {
      this.listeners.delete(callback)
    }
  }

  private notify() {
    this.listeners.forEach((cb) => cb(this.isBgmActive))
  }

  public isPlaying(): boolean {
    return this.isBgmActive
  }

  // ============================================================================
  // PLAYFUL & SOOTHING GENERATIVE BGM (COZY KALIMBA & RHODES ARPEGGIOS)
  // ============================================================================
  public toggleBGM(): boolean {
    const ctx = this.ensureContext()
    if (!ctx) return false

    if (this.isBgmActive) {
      this.stopBGM()
      return false
    } else {
      this.startBGM()
      return true
    }
  }

  public startBGM() {
    const ctx = this.ensureContext()
    if (!ctx || !this.bgmGain || this.isBgmActive) return

    this.isBgmActive = true
    this.notify()

    const now = ctx.currentTime

    // 1. Warm Cozy Filter (Warm Rhodes & Kalimba Timbre)
    this.filterNode = ctx.createBiquadFilter()
    this.filterNode.type = 'lowpass'
    this.filterNode.frequency.setValueAtTime(1400, now)
    this.filterNode.Q.setValueAtTime(1.2, now)
    this.filterNode.connect(this.bgmGain)

    // 2. Playful & Comforting Chord Progression (Cmaj9 -> Am9 -> Dm9 -> G13)
    const progression = [
      {
        bass: 65.41, // C2
        chord: [130.81, 164.81, 246.94, 293.66, 329.63], // C3, E3, B3, D4, E4 (Cmaj9)
      },
      {
        bass: 55.0, // A1
        chord: [110.0, 164.81, 196.0, 261.63, 329.63], // A2, E3, G3, C4, E4 (Am9)
      },
      {
        bass: 73.42, // D2
        chord: [146.83, 174.61, 220.0, 261.63, 329.63], // D3, F3, A3, C4, E4 (Dm9)
      },
      {
        bass: 98.0, // G2
        chord: [146.83, 174.61, 246.94, 329.63, 440.0], // D3, F3, B3, E4, A4 (G13)
      },
    ]

    let stepIndex = 0

    // Warm Rhodes electric piano background pad
    const playWarmPad = (chordNotes: number[]) => {
      if (!this.isBgmActive || !ctx || !this.filterNode) return

      // Smoothly release previous pad voices
      this.bgmOscillators.forEach(({ osc, gain }) => {
        try {
          const t = ctx.currentTime
          gain.gain.cancelScheduledValues(t)
          gain.gain.linearRampToValueAtTime(0, t + 0.9)
          setTimeout(() => {
            try {
              osc.stop()
              osc.disconnect()
            } catch {}
          }, 950)
        } catch {}
      })
      this.bgmOscillators = []

      const chordTime = ctx.currentTime

      chordNotes.forEach((freq, idx) => {
        if (!ctx || !this.filterNode) return

        const osc = ctx.createOscillator()
        const voiceGain = ctx.createGain()
        const panner = ctx.createStereoPanner ? ctx.createStereoPanner() : null

        osc.type = idx % 2 === 0 ? 'triangle' : 'sine'
        osc.frequency.setValueAtTime(freq, chordTime)

        // Subtle slow chorus detuning for a cozy vintage vibe
        const detune = (idx - 2) * 4 + Math.sin(chordTime * 0.5) * 3
        osc.detune.setValueAtTime(detune, chordTime)

        // Gentle envelope
        const targetVol = idx === 0 ? 0.12 : 0.08
        voiceGain.gain.setValueAtTime(0, chordTime)
        voiceGain.gain.linearRampToValueAtTime(targetVol, chordTime + 0.6)

        if (panner) {
          panner.pan.setValueAtTime((idx - 2) * 0.25, chordTime)
          osc.connect(voiceGain)
          voiceGain.connect(panner)
          panner.connect(this.filterNode)
        } else {
          osc.connect(voiceGain)
          voiceGain.connect(this.filterNode)
        }

        osc.start(chordTime)
        this.bgmOscillators.push({ osc, gain: voiceGain })
      })
    }

    // Cozy Acoustic Bass Pluck (Warm bounce)
    const playCozyBass = (bassFreq: number) => {
      if (!this.isBgmActive || !ctx || !this.filterNode) return

      const t = ctx.currentTime
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(bassFreq, t)
      osc.frequency.exponentialRampToValueAtTime(bassFreq * 0.95, t + 0.6)

      gain.gain.setValueAtTime(0, t)
      gain.gain.linearRampToValueAtTime(0.24, t + 0.03)
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.6)

      osc.connect(gain)
      gain.connect(this.filterNode)

      osc.start(t)
      osc.stop(t + 1.65)
    }

    // Play first step immediately
    playWarmPad(progression[0].chord)
    playCozyBass(progression[0].bass)

    // Progression cycle every 4.8 seconds
    this.chordIntervalId = setInterval(() => {
      if (!this.isBgmActive) return
      stepIndex = (stepIndex + 1) % progression.length
      playWarmPad(progression[stepIndex].chord)
      playCozyBass(progression[stepIndex].bass)
    }, 4800)

    // 3. Playful Wooden Kalimba / Music Box Melodic Plucks
    // Pentatonic scale in high octaves: C4, D4, E4, G4, A4, C5, D5, E5, G5, A5, C6
    const kalimbaScale = [
      261.63, 293.66, 329.63, 392.0, 440.0,
      523.25, 587.33, 659.25, 783.99, 880.0, 1046.5,
    ]

    const triggerPlayfulKalimba = () => {
      if (!this.isBgmActive || !ctx || !this.filterNode) return

      const noteTime = ctx.currentTime
      // Pick playful note from scale
      const noteFreq = kalimbaScale[Math.floor(Math.random() * kalimbaScale.length)]

      // Dual-oscillator kalimba voice (Triangle for wooden transient + Sine for sweet chime body)
      const osc1 = ctx.createOscillator()
      const osc2 = ctx.createOscillator()
      const noteGain = ctx.createGain()
      const notePanner = ctx.createStereoPanner ? ctx.createStereoPanner() : null

      osc1.type = 'triangle'
      osc1.frequency.setValueAtTime(noteFreq, noteTime)
      // Rapid pitch decay for wooden pluck strike
      osc1.frequency.exponentialRampToValueAtTime(noteFreq * 0.98, noteTime + 0.04)

      osc2.type = 'sine'
      osc2.frequency.setValueAtTime(noteFreq * 2, noteTime) // Harmonic sparkle

      // Fast percussive attack, sweet bouncy ring
      noteGain.gain.setValueAtTime(0, noteTime)
      noteGain.gain.linearRampToValueAtTime(0.18, noteTime + 0.012)
      noteGain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 1.4)

      osc1.connect(noteGain)
      osc2.connect(noteGain)

      if (notePanner) {
        // Random playful stereo bounce
        notePanner.pan.setValueAtTime((Math.random() - 0.5) * 0.85, noteTime)
        noteGain.connect(notePanner)
        notePanner.connect(this.filterNode)
        if (this.delayNode) {
          notePanner.connect(this.delayNode)
        }
      } else {
        noteGain.connect(this.filterNode)
        if (this.delayNode) {
          noteGain.connect(this.delayNode)
        }
      }

      osc1.start(noteTime)
      osc2.start(noteTime)
      osc1.stop(noteTime + 1.45)
      osc2.stop(noteTime + 1.45)

      // Schedule next playful note with rhythmic syncopation (between 400ms and 1100ms)
      const rhythms = [350, 480, 650, 800, 950]
      const nextDelay = rhythms[Math.floor(Math.random() * rhythms.length)]
      this.bgmIntervalId = setTimeout(triggerPlayfulKalimba, nextDelay)
    }

    // Trigger first kalimba pluck right away
    setTimeout(triggerPlayfulKalimba, 400)

    // Smooth BGM Master Fade In
    this.bgmGain.gain.cancelScheduledValues(now)
    this.bgmGain.gain.setValueAtTime(0, now)
    this.bgmGain.gain.linearRampToValueAtTime(this.bgmVolume, now + 0.6)
  }

  public stopBGM() {
    if (!this.ctx || !this.bgmGain || !this.isBgmActive) return

    this.isBgmActive = false
    this.notify()

    if (this.bgmIntervalId) {
      clearTimeout(this.bgmIntervalId)
      this.bgmIntervalId = null
    }

    if (this.chordIntervalId) {
      clearInterval(this.chordIntervalId)
      this.chordIntervalId = null
    }

    if (this.bassIntervalId) {
      clearInterval(this.bassIntervalId)
      this.bassIntervalId = null
    }

    const now = this.ctx.currentTime
    this.bgmGain.gain.cancelScheduledValues(now)
    this.bgmGain.gain.linearRampToValueAtTime(0, now + 0.7)

    setTimeout(() => {
      this.bgmOscillators.forEach(({ osc }) => {
        try {
          osc.stop()
          osc.disconnect()
        } catch {}
      })
      this.bgmOscillators = []
    }, 750)
  }

  // ============================================================================
  // TACTILE LUXURY SOUND EFFECTS (SFX)
  // ============================================================================

  // Subtle acoustic hover tick
  public playHover() {
    const ctx = this.ensureContext()
    if (!ctx || !this.sfxGain) return
    try {
      const now = ctx.currentTime
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(1600, now)
      osc.frequency.exponentialRampToValueAtTime(1000, now + 0.02)

      gain.gain.setValueAtTime(0.06, now)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.02)

      osc.connect(gain)
      gain.connect(this.sfxGain)

      osc.start(now)
      osc.stop(now + 0.025)
    } catch {}
  }

  // Tactile button click
  public playClick() {
    const ctx = this.ensureContext()
    if (!ctx || !this.sfxGain) return
    try {
      const now = ctx.currentTime
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'triangle'
      osc.frequency.setValueAtTime(820, now)
      osc.frequency.exponentialRampToValueAtTime(260, now + 0.045)

      gain.gain.setValueAtTime(0.18, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045)

      osc.connect(gain)
      gain.connect(this.sfxGain)

      osc.start(now)
      osc.stop(now + 0.05)
    } catch {}
  }

  // Uplifting major chord chime
  public playSuccess() {
    const ctx = this.ensureContext()
    if (!ctx || !this.sfxGain) return
    try {
      const now = ctx.currentTime
      const freqs = [523.25, 659.25, 783.99, 1046.5]
      freqs.forEach((freq, idx) => {
        if (!ctx || !this.sfxGain) return
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()

        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq, now + idx * 0.04)

        gain.gain.setValueAtTime(0, now + idx * 0.04)
        gain.gain.linearRampToValueAtTime(0.12, now + idx * 0.04 + 0.02)
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.04 + 0.45)

        osc.connect(gain)
        gain.connect(this.sfxGain)

        osc.start(now + idx * 0.04)
        osc.stop(now + idx * 0.04 + 0.48)
      })
    } catch {}
  }

  // Liquid Paint Splash & Fluid Wave Sound
  public playChime(isDark: boolean = true) {
    const ctx = this.ensureContext()
    if (!ctx || !this.sfxGain) return
    try {
      const now = ctx.currentTime

      // 1. Visceral Liquid Paint Surge Wave
      const waveOsc = ctx.createOscillator()
      const waveGain = ctx.createGain()
      const waveFilter = ctx.createBiquadFilter()

      waveOsc.type = 'triangle'
      waveOsc.frequency.setValueAtTime(isDark ? 140 : 180, now)
      waveOsc.frequency.exponentialRampToValueAtTime(isDark ? 280 : 360, now + 0.25)
      waveOsc.frequency.exponentialRampToValueAtTime(isDark ? 95 : 120, now + 0.8)

      waveFilter.type = 'lowpass'
      waveFilter.frequency.setValueAtTime(450, now)
      waveFilter.frequency.linearRampToValueAtTime(900, now + 0.3)
      waveFilter.frequency.linearRampToValueAtTime(250, now + 0.85)

      waveGain.gain.setValueAtTime(0, now)
      waveGain.gain.linearRampToValueAtTime(0.18, now + 0.15)
      waveGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.9)

      waveOsc.connect(waveFilter)
      waveFilter.connect(waveGain)
      waveGain.connect(this.sfxGain)

      waveOsc.start(now)
      waveOsc.stop(now + 0.95)

      // 2. Liquid Paint Splatter Droplets
      const dropletFreqs = isDark
        ? [380, 520, 680, 440]
        : [440, 680, 520, 380]

      dropletFreqs.forEach((freq, idx) => {
        if (!ctx || !this.sfxGain) return
        const dropOsc = ctx.createOscillator()
        const dropGain = ctx.createGain()

        const triggerAt = now + 0.1 + idx * 0.08
        dropOsc.type = 'sine'
        dropOsc.frequency.setValueAtTime(freq * 1.4, triggerAt)
        dropOsc.frequency.exponentialRampToValueAtTime(freq * 0.7, triggerAt + 0.06)

        dropGain.gain.setValueAtTime(0, triggerAt)
        dropGain.gain.linearRampToValueAtTime(0.09, triggerAt + 0.01)
        dropGain.gain.exponentialRampToValueAtTime(0.0001, triggerAt + 0.15)

        dropOsc.connect(dropGain)
        dropGain.connect(this.sfxGain)

        dropOsc.start(triggerAt)
        dropOsc.stop(triggerAt + 0.18)
      })
    } catch {}
  }

  // Soft delete tone
  public playDelete() {
    const ctx = this.ensureContext()
    if (!ctx || !this.sfxGain) return
    try {
      const now = ctx.currentTime
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(360, now)
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.09)

      gain.gain.setValueAtTime(0.12, now)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09)

      osc.connect(gain)
      gain.connect(this.sfxGain)

      osc.start(now)
      osc.stop(now + 0.1)
    } catch {}
  }
}

export const audioEngine = new LusionAudioEngine()
