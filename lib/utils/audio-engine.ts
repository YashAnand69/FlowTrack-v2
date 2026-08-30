// ==============================================================================
// FlowTrack Playful Generative Groove Engine (Upbeat, Bouncy, Catchy & Fun)
// Synthesized natively via Web Audio API (0 external assets, zero latency)
// ==============================================================================

class LusionAudioEngine {
  private ctx: AudioContext | null = null
  private masterGain: GainNode | null = null
  private bgmGain: GainNode | null = null
  private sfxGain: GainNode | null = null

  // Playful BGM Engine Variables
  private isBgmActive: boolean = false
  private bgmIntervalId: any = null
  private stepCounter: number = 0
  private filterNode: BiquadFilterNode | null = null
  private delayNode: DelayNode | null = null
  private delayFeedback: GainNode | null = null

  // Volume staging
  private bgmVolume: number = 0.55
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

      // Bouncy Stereo Ping-Pong Delay Bus
      this.delayNode = this.ctx.createDelay()
      this.delayNode.delayTime.setValueAtTime(0.18, this.ctx.currentTime)

      this.delayFeedback = this.ctx.createGain()
      this.delayFeedback.gain.setValueAtTime(0.32, this.ctx.currentTime)

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
  // UPBEAT & PLAYFUL GENERATIVE SYNTH-GROOVE BGM (120 BPM)
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

    // 1. Crisp Dynamic Lowpass Filter
    this.filterNode = ctx.createBiquadFilter()
    this.filterNode.type = 'lowpass'
    this.filterNode.frequency.setValueAtTime(2800, now)
    this.filterNode.Q.setValueAtTime(1.5, now)
    this.filterNode.connect(this.bgmGain)

    // 2. Playful Chord & Bass Progression Map (C -> Am -> F -> G)
    const patterns = [
      {
        bassNotes: [65.41, 65.41, 130.81, 98.0], // C2, C2, C3, G2
        stabs: [261.63, 329.63, 392.0, 493.88],  // C4, E4, G4, B4 (Cmaj7)
        melodyPool: [261.63, 293.66, 329.63, 392.0, 523.25, 659.25, 783.99],
      },
      {
        bassNotes: [55.0, 55.0, 110.0, 82.41],   // A1, A1, A2, E2
        stabs: [220.0, 261.63, 329.63, 392.0],   // A3, C4, E4, G4 (Am7)
        melodyPool: [220.0, 261.63, 329.63, 440.0, 523.25, 659.25, 880.0],
      },
      {
        bassNotes: [43.65, 87.31, 130.81, 87.31], // F1, F2, C3, F2
        stabs: [174.61, 220.0, 261.63, 329.63],  // F3, A3, C4, E4 (Fmaj7)
        melodyPool: [261.63, 329.63, 349.23, 392.0, 523.25, 659.25, 698.46],
      },
      {
        bassNotes: [49.0, 98.0, 146.83, 110.0],  // G1, G2, D3, A2
        stabs: [196.0, 246.94, 293.66, 349.23],  // G3, B3, D4, F4 (G7)
        melodyPool: [246.94, 293.66, 392.0, 493.88, 587.33, 783.99, 987.77],
      },
    ]

    this.stepCounter = 0
    const stepTimeMs = 125 // 16th note at 120 BPM

    // Synth Drum / Woodblock Click
    const playClickBeat = (isAccent: boolean) => {
      if (!this.isBgmActive || !ctx || !this.filterNode) return
      const t = ctx.currentTime
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'triangle'
      osc.frequency.setValueAtTime(isAccent ? 1200 : 750, t)
      osc.frequency.exponentialRampToValueAtTime(120, t + 0.025)

      gain.gain.setValueAtTime(0, t)
      gain.gain.linearRampToValueAtTime(isAccent ? 0.08 : 0.04, t + 0.003)
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.03)

      osc.connect(gain)
      gain.connect(this.filterNode)

      osc.start(t)
      osc.stop(t + 0.035)
    }

    // Bouncy Synth Bass Pluck
    const playBassNote = (freq: number) => {
      if (!this.isBgmActive || !ctx || !this.filterNode) return
      const t = ctx.currentTime
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(freq, t)
      osc.frequency.exponentialRampToValueAtTime(freq * 0.96, t + 0.08)

      gain.gain.setValueAtTime(0, t)
      gain.gain.linearRampToValueAtTime(0.18, t + 0.008)
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.22)

      // Punchy Bass Filter
      const bassFilter = ctx.createBiquadFilter()
      bassFilter.type = 'lowpass'
      bassFilter.frequency.setValueAtTime(480, t)
      bassFilter.frequency.exponentialRampToValueAtTime(140, t + 0.2)

      osc.connect(bassFilter)
      bassFilter.connect(gain)
      gain.connect(this.filterNode)

      osc.start(t)
      osc.stop(t + 0.24)
    }

    // Playful Bubble / Marimba Pluck
    const playBubbleNote = (freq: number, pan: number = 0) => {
      if (!this.isBgmActive || !ctx || !this.filterNode) return
      const t = ctx.currentTime
      const osc = ctx.createOscillator()
      const oscHarmonic = ctx.createOscillator()
      const gain = ctx.createGain()
      const panner = ctx.createStereoPanner ? ctx.createStereoPanner() : null

      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, t)
      osc.frequency.exponentialRampToValueAtTime(freq * 1.02, t + 0.02)
      osc.frequency.exponentialRampToValueAtTime(freq, t + 0.08)

      oscHarmonic.type = 'triangle'
      oscHarmonic.frequency.setValueAtTime(freq * 2, t)

      gain.gain.setValueAtTime(0, t)
      gain.gain.linearRampToValueAtTime(0.16, t + 0.006)
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.25)

      osc.connect(gain)
      oscHarmonic.connect(gain)

      if (panner) {
        panner.pan.setValueAtTime(pan, t)
        gain.connect(panner)
        panner.connect(this.filterNode)
        if (this.delayNode) panner.connect(this.delayNode)
      } else {
        gain.connect(this.filterNode)
        if (this.delayNode) gain.connect(this.delayNode)
      }

      osc.start(t)
      oscHarmonic.start(t)
      osc.stop(t + 0.28)
      oscHarmonic.stop(t + 0.28)
    }

    // Upbeat Staccato Offbeat Chord Stab
    const playChordStab = (notes: number[]) => {
      if (!this.isBgmActive || !ctx || !this.filterNode) return
      const t = ctx.currentTime

      notes.forEach((freq) => {
        if (!ctx || !this.filterNode) return
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()

        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq, t)

        gain.gain.setValueAtTime(0, t)
        gain.gain.linearRampToValueAtTime(0.06, t + 0.006)
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.12)

        osc.connect(gain)
        gain.connect(this.filterNode)

        osc.start(t)
        osc.stop(t + 0.14)
      })
    }

    // Main 16th-note Playful Step Sequencer Loop
    const runStep = () => {
      if (!this.isBgmActive || !ctx) return

      const barStep = this.stepCounter % 16 // 16 steps per bar
      const currentBar = Math.floor(this.stepCounter / 16) % patterns.length
      const pat = patterns[currentBar]

      // 1. Playful Bass (Steps 0, 4, 8, 12, with occasional 16th bounce)
      if (barStep === 0) playBassNote(pat.bassNotes[0])
      if (barStep === 4) playBassNote(pat.bassNotes[1])
      if (barStep === 8) playBassNote(pat.bassNotes[2])
      if (barStep === 11 || barStep === 14) playBassNote(pat.bassNotes[3])

      // 2. Offbeat Funky Chord Stabs (Steps 2, 6, 10, 14)
      if (barStep === 2 || barStep === 6 || barStep === 10 || barStep === 14) {
        playChordStab(pat.stabs)
      }

      // 3. Playful Bubble Marimba Melodies (Dancing arpeggios on steps)
      const playMelodySteps = [0, 3, 6, 8, 10, 12, 15]
      if (playMelodySteps.includes(barStep)) {
        const noteIdx = (barStep + this.stepCounter) % pat.melodyPool.length
        const pan = ((barStep % 4) - 1.5) * 0.5
        playBubbleNote(pat.melodyPool[noteIdx], pan)
      }

      // 4. Subtle Percussive Groove (Every quarter note)
      if (barStep % 4 === 0) {
        playClickBeat(barStep === 0)
      }

      this.stepCounter++
      this.bgmIntervalId = setTimeout(runStep, stepTimeMs)
    }

    // Start upbeat sequencer
    runStep()

    // Smooth BGM Master Fade In
    this.bgmGain.gain.cancelScheduledValues(now)
    this.bgmGain.gain.setValueAtTime(0, now)
    this.bgmGain.gain.linearRampToValueAtTime(this.bgmVolume, now + 0.4)
  }

  public stopBGM() {
    if (!this.ctx || !this.bgmGain || !this.isBgmActive) return

    this.isBgmActive = false
    this.notify()

    if (this.bgmIntervalId) {
      clearTimeout(this.bgmIntervalId)
      this.bgmIntervalId = null
    }

    const now = this.ctx.currentTime
    this.bgmGain.gain.cancelScheduledValues(now)
    this.bgmGain.gain.linearRampToValueAtTime(0, now + 0.4)
  }

  // ============================================================================
  // TACTILE SOUND EFFECTS (SFX)
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
