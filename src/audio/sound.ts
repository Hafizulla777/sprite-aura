export type SoundName = 'hover' | 'click' | 'whoosh' | 'chime'

/* Synthesized UI sounds — no audio files needed.
   Every sound is generated live with the Web Audio API. */
class SoundEngine {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private noiseBuf: AudioBuffer | null = null
  muted = false

  private ensure(): AudioContext | null {
    if (typeof window === 'undefined') return null
    if (!this.ctx) {
      const AC: typeof AudioContext | undefined =
        window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!AC) return null
      try {
        this.ctx = new AC()
      } catch {
        return null
      }
      this.master = this.ctx.createGain()
      this.master.gain.value = 0.45
      this.master.connect(this.ctx.destination)
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume()
    return this.ctx
  }

  private noise(ctx: AudioContext): AudioBuffer {
    if (!this.noiseBuf) {
      const len = Math.floor(ctx.sampleRate * 0.4)
      this.noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate)
      const data = this.noiseBuf.getChannelData(0)
      for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1
    }
    return this.noiseBuf
  }

  play(name: SoundName) {
    if (this.muted) return
    const ctx = this.ensure()
    if (!ctx || !this.master) return
    const t = ctx.currentTime
    switch (name) {
      case 'hover': this.hover(ctx, t); break
      case 'click': this.click(ctx, t); break
      case 'whoosh': this.whoosh(ctx, t); break
      case 'chime': this.chime(ctx, t); break
    }
  }

  /* soft tick on hover */
  private hover(ctx: AudioContext, t: number) {
    const osc = ctx.createOscillator()
    const g = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(980, t)
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(0.05, t + 0.008)
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05)
    osc.connect(g).connect(this.master!)
    osc.start(t)
    osc.stop(t + 0.06)
    osc.onended = () => osc.disconnect()
  }

  /* crisp tactile click */
  private click(ctx: AudioContext, t: number) {
    const osc = ctx.createOscillator()
    const g = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(1150, t)
    osc.frequency.exponentialRampToValueAtTime(240, t + 0.07)
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(0.28, t + 0.006)
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.1)
    osc.connect(g).connect(this.master!)
    osc.start(t)
    osc.stop(t + 0.11)
    osc.onended = () => osc.disconnect()

    // tiny noise transient for realism
    const src = ctx.createBufferSource()
    const hp = ctx.createBiquadFilter()
    const ng = ctx.createGain()
    src.buffer = this.noise(ctx)
    hp.type = 'highpass'
    hp.frequency.value = 2500
    ng.gain.setValueAtTime(0.08, t)
    ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.03)
    src.connect(hp).connect(ng).connect(this.master!)
    src.start(t, 0, 0.04)
    src.onended = () => src.disconnect()
  }

  /* airy sweep for big actions */
  private whoosh(ctx: AudioContext, t: number) {
    const src = ctx.createBufferSource()
    const bp = ctx.createBiquadFilter()
    const g = ctx.createGain()
    src.buffer = this.noise(ctx)
    bp.type = 'bandpass'
    bp.Q.value = 1.1
    bp.frequency.setValueAtTime(320, t)
    bp.frequency.exponentialRampToValueAtTime(2800, t + 0.28)
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(0.2, t + 0.07)
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.32)
    src.connect(bp).connect(g).connect(this.master!)
    src.start(t)
    src.stop(t + 0.34)
    src.onended = () => src.disconnect()
  }

  /* two-note confirmation bell */
  private chime(ctx: AudioContext, t: number) {
    const notes: Array<[number, number, number]> = [
      [659.25, 0.14, 0],
      [987.77, 0.09, 0.07],
    ]
    for (const [freq, vol, delay] of notes) {
      const osc = ctx.createOscillator()
      const g = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = freq
      const s = t + delay
      g.gain.setValueAtTime(0.0001, s)
      g.gain.exponentialRampToValueAtTime(vol, s + 0.012)
      g.gain.exponentialRampToValueAtTime(0.0001, s + 0.55)
      osc.connect(g).connect(this.master!)
      osc.start(s)
      osc.stop(s + 0.6)
      osc.onended = () => osc.disconnect()
    }
  }
}

export const sound = new SoundEngine()
