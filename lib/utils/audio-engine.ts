// ==============================================================================
// FlowTrack Generative Ambient Soundscape & Sound FX Engine (Lusion-Inspired)
// Synthesized natively via Web Audio API (0 external assets, zero latency, pure luxury)
// ==============================================================================

class LusionAudioEngine {
  private ctx: AudioContext | null = null
  private masterGain: GainNode | null = null
  private bgmGain: GainNode | null = null
  private sfxGain: GainNode | null = null

  // Ambient BGM Nodes
  private isBgmActive: boolean = false
  private bgmOscillators: OscillatorNode[] = []
  private bgmIntervalId: any = null
  private droneGain: GainNode | null = null
  private filterNode: BiquadFilterNode | null = null

  // Settings
  private bgmVolume: number = 0.22
  private sfxVolume: number = 0.35
  private listeners: Set<(isPlaying: boolean) => void> = new Set()

  constructor() {
    // Lazy init on first user interaction
  }

  private init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
      if (AudioCtx) {
        this.ctx = new AudioCtx()

        // Master Gain
        this.masterGain = this.ctx.createGain()
        this.masterGain.gain.setValueAtTime(1.0, this.ctx.currentTime)
        this.masterGain.connect(this.ctx.destination)

        // BGM Sub-Bus
        this.bgmGain = this.ctx.createGain()
        this.bgmGain.gain.setValueAtTime(0, this.ctx.currentTime)
        this.bgmGain.connect(this.masterGain)

        // SFX Sub-Bus
        this.sfxGain = this.ctx.createGain()
        this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime)
        this.sfxGain.connect(this.masterGain)
      }
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume()
    }
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

  // ============================================================================
  // GENERATIVE AMBIENT SOUNDSCAPE (LUSION-GRADE SOOTHING BGM)
  // ============================================================================
  public toggleBGM(): boolean {
    this.init()
    if (!this.ctx || !this.bgmGain) return false

    if (this.isBgmActive) {
      this.stopBGM()
      return false
    } else {
      this.startBGM()
      return true
    }
  }

  public isPlaying(): boolean {
    return this.isBgmActive
  }

  public startBGM() {
    this.init()
    if (!this.ctx || !this.bgmGain || this.isBgmActive) return

    this.isBgmActive = true
    this.notify()

    const now = this.ctx.currentTime

    // 1. Warm Analog Lowpass Filter (Warm velvet timbre)
    this.filterNode = this.ctx.createBiquadFilter()
    this.filterNode.type = 'lowpass'
    this.filterNode.frequency.setValueAtTime(550, now)
    this.filterNode.Q.setValueAtTime(2.5, now)
    this.filterNode.connect(this.bgmGain)

    // 2. Multi-Voice Lush Ambient Drone Chord (Cmaj9 / Fmaj7 meditative frequencies)
    // Frequencies: C2 (65.4Hz), G2 (98.0Hz), E3 (164.8Hz), B3 (246.9Hz), D4 (293.7Hz)
    const chordFrequencies = [65.41, 98.0, 164.81, 246.94, 293.66]
    this.bgmOscillators = []

    this.droneGain = this.ctx.createGain()
    this.droneGain.gain.setValueAtTime(0.08, now)
    this.droneGain.connect(this.filterNode)

    chordFrequencies.forEach((freq, idx) => {
      if (!this.ctx || !this.droneGain) return

      const osc = this.ctx.createOscillator()
      const panner = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null
      const voiceGain = this.ctx.createGain()

      osc.type = idx === 0 ? 'sine' : idx % 2 === 0 ? 'triangle' : 'sine'
      osc.frequency.setValueAtTime(freq, now)

      // Micro-detune for organic lush chorusing
      osc.detune.setValueAtTime((idx - 2) * 6 + Math.random() * 4, now)

      // Individual voice volume
      voiceGain.gain.setValueAtTime(idx === 0 ? 0.35 : 0.18, now)

      if (panner) {
        panner.pan.setValueAtTime((idx - 2) * 0.35, now)
        osc.connect(voiceGain)
        voiceGain.connect(panner)
        panner.connect(this.droneGain)
      } else {
        osc.connect(voiceGain)
        voiceGain.connect(this.droneGain)
      }

      osc.start(now)
      this.bgmOscillators.push(osc)
    })

    // 3. Generative Crystalline Pentatonic Harp Drops (Relaxing meditation notes)
    // Pentatonic scale notes: C4 (261.6), D4 (293.7), E4 (329.6), G4 (392.0), A4 (440.0), C5 (523.3), E5 (659.3)
    const pentatonicNotes = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 659.25]

    const triggerGenerativeNote = () => {
      if (!this.isBgmActive || !this.ctx || !this.filterNode) return

      const noteTime = this.ctx.currentTime
      const noteFreq = pentatonicNotes[Math.floor(Math.random() * pentatonicNotes.length)]

      const osc = this.ctx.createOscillator()
      const noteGain = this.ctx.createGain()
      const notePanner = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null

      osc.type = 'sine'
      osc.frequency.setValueAtTime(noteFreq, noteTime)

      // Soft envelope: Gentle attack & long crystalline decay (1.8s)
      noteGain.gain.setValueAtTime(0, noteTime)
      noteGain.gain.linearRampToValueAtTime(0.04, noteTime + 0.15)
      noteGain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 2.2)

      if (notePanner) {
        notePanner.pan.setValueAtTime((Math.random() - 0.5) * 0.8, noteTime)
        osc.connect(noteGain)
        noteGain.connect(notePanner)
        notePanner.connect(this.filterNode)
      } else {
        osc.connect(noteGain)
        noteGain.connect(this.filterNode)
      }

      osc.start(noteTime)
      osc.stop(noteTime + 2.3)

      // Subtle filter breathing
      if (this.filterNode) {
        this.filterNode.frequency.linearRampToValueAtTime(
          450 + Math.random() * 300,
          noteTime + 1.5
        )
      }

      // Schedule next random tranquil note (every 1.5s - 3.5s)
      const nextDelay = 1600 + Math.random() * 2000
      this.bgmIntervalId = setTimeout(triggerGenerativeNote, nextDelay)
    }

    // Start tranquil generator loop
    triggerGenerativeNote()

    // Smooth 1.8s crossfade in (no clicks)
    this.bgmGain.gain.cancelScheduledValues(now)
    this.bgmGain.gain.setValueAtTime(0, now)
    this.bgmGain.gain.linearRampToValueAtTime(this.bgmVolume, now + 1.8)
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
    // Smooth 1.2s crossfade out
    this.bgmGain.gain.cancelScheduledValues(now)
    this.bgmGain.gain.linearRampToValueAtTime(0, now + 1.2)

    setTimeout(() => {
      this.bgmOscillators.forEach((osc) => {
        try {
          osc.stop()
          osc.disconnect()
        } catch {}
      })
      this.bgmOscillators = []
    }, 1300)
  }

  // ============================================================================
  // TACTILE LUXURY SOUND EFFECTS (SFX)
  // ============================================================================

  // Subtle acoustic hover tick (ultra-light)
  public playHover() {
    this.init()
    if (!this.ctx || !this.sfxGain) return
    try {
      const now = this.ctx.currentTime
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(1400, now)
      osc.frequency.exponentialRampToValueAtTime(900, now + 0.018)

      gain.gain.setValueAtTime(0.015, now)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.018)

      osc.connect(gain)
      gain.connect(this.sfxGain)

      osc.start(now)
      osc.stop(now + 0.02)
    } catch {}
  }

  // Tactile mechanical button click
  public playClick() {
    this.init()
    if (!this.ctx || !this.sfxGain) return
    try {
      const now = this.ctx.currentTime
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()

      osc.type = 'triangle'
      osc.frequency.setValueAtTime(750, now)
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.04)

      gain.gain.setValueAtTime(0.045, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04)

      osc.connect(gain)
      gain.connect(this.sfxGain)

      osc.start(now)
      osc.stop(now + 0.045)
    } catch {}
  }

  // Uplifting chord chime (Success / Paid / Saved)
  public playSuccess() {
    this.init()
    if (!this.ctx || !this.sfxGain) return
    try {
      const now = this.ctx.currentTime
      // Harmonic major chord triad: C5, E5, G5
      const freqs = [523.25, 659.25, 783.99]
      freqs.forEach((freq, idx) => {
        if (!this.ctx || !this.sfxGain) return
        const osc = this.ctx.createOscillator()
        const gain = this.ctx.createGain()

        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq, now + idx * 0.035)

        gain.gain.setValueAtTime(0, now + idx * 0.035)
        gain.gain.linearRampToValueAtTime(0.03, now + idx * 0.035 + 0.02)
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.035 + 0.35)

        osc.connect(gain)
        gain.connect(this.sfxGain)

        osc.start(now + idx * 0.035)
        osc.stop(now + idx * 0.035 + 0.38)
      })
    } catch {}
  }

  // Smooth mode toggle harmonic chime
  public playChime(isDark: boolean = true) {
    this.init()
    if (!this.ctx || !this.sfxGain) return
    try {
      const now = this.ctx.currentTime
      const freqs = isDark ? [440, 659.25] : [659.25, 880]
      freqs.forEach((freq, idx) => {
        if (!this.ctx || !this.sfxGain) return
        const osc = this.ctx.createOscillator()
        const gain = this.ctx.createGain()

        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq, now + idx * 0.05)

        gain.gain.setValueAtTime(0.03, now + idx * 0.05)
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.05 + 0.22)

        osc.connect(gain)
        gain.connect(this.sfxGain)

        osc.start(now + idx * 0.05)
        osc.stop(now + idx * 0.05 + 0.24)
      })
    } catch {}
  }

  // Soft delete / remove tone
  public playDelete() {
    this.init()
    if (!this.ctx || !this.sfxGain) return
    try {
      const now = this.ctx.currentTime
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(320, now)
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.08)

      gain.gain.setValueAtTime(0.03, now)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08)

      osc.connect(gain)
      gain.connect(this.sfxGain)

      osc.start(now)
      osc.stop(now + 0.09)
    } catch {}
  }
}

export const audioEngine = new LusionAudioEngine()
