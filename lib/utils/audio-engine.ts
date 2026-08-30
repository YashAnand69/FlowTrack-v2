// ==============================================================================
// FlowTrack Soothing & Calm Generative Ambient Soundscape (Lusion / Meditative)
// Synthesized natively via Web Audio API (0 external assets, zero latency, pure calm)
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
  private filterNode: BiquadFilterNode | null = null
  private delayNode: DelayNode | null = null
  private delayFeedback: GainNode | null = null

  // Volume staging (tuned for clear, warm, soothing presence)
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

      // Ambient Stereo Delay / Space Reverb Bus
      this.delayNode = this.ctx.createDelay()
      this.delayNode.delayTime.setValueAtTime(0.42, this.ctx.currentTime)

      this.delayFeedback = this.ctx.createGain()
      this.delayFeedback.gain.setValueAtTime(0.40, this.ctx.currentTime)

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
  // SOOTHING & CALM GENERATIVE AMBIENT SOUNDSCAPE (432Hz MEDITATIVE SCALE)
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

    // 1. Warm Velvet Analog Lowpass Filter (Comforting, warm timbre)
    this.filterNode = ctx.createBiquadFilter()
    this.filterNode.type = 'lowpass'
    this.filterNode.frequency.setValueAtTime(850, now)
    this.filterNode.Q.setValueAtTime(1.5, now)
    this.filterNode.connect(this.bgmGain)

    // 2. Meditative 432Hz Harmonic Chord Progressions (Fmaj9 -> Am9 -> Cmaj7 -> Gsus4)
    const chordProgressions = [
      // Fmaj9: F2, C3, E3, A3, G4
      [87.31, 130.81, 164.81, 220.0, 392.0],
      // Am9: A2, E3, G3, C4, B4
      [110.0, 164.81, 196.0, 261.63, 493.88],
      // Cmaj7: C2, G2, E3, B3, D4
      [65.41, 98.0, 164.81, 246.94, 293.66],
      // Gsus4: G2, D3, G3, C4, D4
      [98.0, 146.83, 196.0, 261.63, 293.66],
    ]

    let currentChordIdx = 0

    // Lush warm ambient chord pads with multi-oscillator detuning
    const playChordPads = (chord: number[]) => {
      if (!this.isBgmActive || !ctx || !this.filterNode) return

      // Smoothly release previous chord pads
      this.bgmOscillators.forEach(({ osc, gain }) => {
        try {
          const t = ctx.currentTime
          gain.gain.cancelScheduledValues(t)
          gain.gain.linearRampToValueAtTime(0, t + 1.8)
          setTimeout(() => {
            try {
              osc.stop()
              osc.disconnect()
            } catch {}
          }, 1900)
        } catch {}
      })
      this.bgmOscillators = []

      const chordTime = ctx.currentTime

      chord.forEach((freq, idx) => {
        if (!ctx || !this.filterNode) return

        const osc = ctx.createOscillator()
        const voiceGain = ctx.createGain()
        const panner = ctx.createStereoPanner ? ctx.createStereoPanner() : null

        // Lush blend of pure sine & warm triangle
        osc.type = idx === 0 ? 'sine' : idx % 2 === 0 ? 'triangle' : 'sine'
        osc.frequency.setValueAtTime(freq, chordTime)

        // Micro-chorus detuning for rich organic warmth
        const detuneAmount = (idx - 2) * 4 + (Math.random() - 0.5) * 3
        osc.detune.setValueAtTime(detuneAmount, chordTime)

        // Slow, soothing swelling envelope (1.8s attack, steady warm sustain)
        const targetVol = idx === 0 ? 0.22 : 0.12
        voiceGain.gain.setValueAtTime(0, chordTime)
        voiceGain.gain.linearRampToValueAtTime(targetVol, chordTime + 1.8)

        if (panner) {
          panner.pan.setValueAtTime((idx - 2) * 0.35, chordTime)
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

    // Play first chord immediately
    playChordPads(chordProgressions[currentChordIdx])

    // Morph chord slowly every 7.5 seconds
    this.chordIntervalId = setInterval(() => {
      if (!this.isBgmActive) return
      currentChordIdx = (currentChordIdx + 1) % chordProgressions.length
      playChordPads(chordProgressions[currentChordIdx])
    }, 7500)

    // 3. Generative Crystalline Pentatonic Harp & Bell Drops (Calm & Soothing)
    const bellScale = [
      261.63, // C4
      293.66, // D4
      329.63, // E4
      392.0,  // G4
      440.0,  // A4
      523.25, // C5
      587.33, // D5
      659.25, // E5
      783.99, // G5
      880.0,  // A5
      1046.5, // C6
    ]

    const triggerGenerativeChime = () => {
      if (!this.isBgmActive || !ctx || !this.filterNode) return

      const chimeTime = ctx.currentTime
      const chimeFreq = bellScale[Math.floor(Math.random() * bellScale.length)]

      const osc = ctx.createOscillator()
      const chimeGain = ctx.createGain()
      const panner = ctx.createStereoPanner ? ctx.createStereoPanner() : null

      osc.type = 'sine'
      osc.frequency.setValueAtTime(chimeFreq, chimeTime)

      // Crystalline bell envelope: Gentle attack (0.05s), long peaceful decay (2.8s)
      chimeGain.gain.setValueAtTime(0, chimeTime)
      chimeGain.gain.linearRampToValueAtTime(0.16, chimeTime + 0.05)
      chimeGain.gain.exponentialRampToValueAtTime(0.0001, chimeTime + 2.8)

      if (panner) {
        panner.pan.setValueAtTime((Math.random() - 0.5) * 0.85, chimeTime)
        osc.connect(chimeGain)
        chimeGain.connect(panner)
        panner.connect(this.filterNode)
        if (this.delayNode) {
          panner.connect(this.delayNode)
        }
      } else {
        osc.connect(chimeGain)
        chimeGain.connect(this.filterNode)
        if (this.delayNode) {
          chimeGain.connect(this.delayNode)
        }
      }

      osc.start(chimeTime)
      osc.stop(chimeTime + 2.9)

      // Schedule next soothing note (every 1.5s to 3.0s)
      const nextDelay = 1500 + Math.random() * 1500
      this.bgmIntervalId = setTimeout(triggerGenerativeChime, nextDelay)
    }

    // Trigger first chime after 800ms
    setTimeout(triggerGenerativeChime, 800)

    // Smooth BGM Master Fade In
    this.bgmGain.gain.cancelScheduledValues(now)
    this.bgmGain.gain.setValueAtTime(0, now)
    this.bgmGain.gain.linearRampToValueAtTime(this.bgmVolume, now + 1.2)
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

    const now = this.ctx.currentTime
    this.bgmGain.gain.cancelScheduledValues(now)
    this.bgmGain.gain.linearRampToValueAtTime(0, now + 1.0)

    setTimeout(() => {
      this.bgmOscillators.forEach(({ osc }) => {
        try {
          osc.stop()
          osc.disconnect()
        } catch {}
      })
      this.bgmOscillators = []
    }, 1100)
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
