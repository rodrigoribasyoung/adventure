// Sistema de sons de tecnologia para eventos dinâmicos

class SoundManager {
  private audioContext: AudioContext | null = null
  private isEnabled = true
  private volume = 0.15

  private initAudioContext() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    return this.audioContext
  }

  private createTone(
    frequency: number,
    duration: number,
    type: OscillatorType = 'sine',
    volume: number = this.volume
  ) {
    try {
      const ctx = this.initAudioContext()
      const now = ctx.currentTime

      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()
      const filter = ctx.createBiquadFilter()

      oscillator.type = type
      oscillator.frequency.setValueAtTime(frequency, now)

      filter.type = 'lowpass'
      filter.frequency.setValueAtTime(2000, now)
      filter.Q.setValueAtTime(1, now)

      gainNode.gain.setValueAtTime(0, now)
      gainNode.gain.linearRampToValueAtTime(volume, now + 0.01)
      gainNode.gain.linearRampToValueAtTime(volume, now + duration * 0.8)
      gainNode.gain.linearRampToValueAtTime(0, now + duration)

      oscillator.connect(filter)
      filter.connect(gainNode)
      gainNode.connect(ctx.destination)

      oscillator.start(now)
      oscillator.stop(now + duration)

      return oscillator
    } catch (error) {
      console.log('Erro ao criar som:', error)
      return null
    }
  }

  // Som de hover suave - tecnologia moderna
  hover() {
    if (!this.isEnabled) return
    const ctx = this.initAudioContext()
    const now = ctx.currentTime

    // Som sutil de frequência modulada
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    const filter = ctx.createBiquadFilter()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(1200, now)
    osc.frequency.linearRampToValueAtTime(1300, now + 0.08)

    filter.type = 'bandpass'
    filter.frequency.setValueAtTime(1200, now)
    filter.Q.setValueAtTime(2, now)

    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(this.volume * 0.15, now + 0.02)
    gain.gain.linearRampToValueAtTime(0, now + 0.08)

    osc.connect(filter)
    filter.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + 0.08)
  }

  // Som de clique - tecnologia moderna
  click() {
    if (!this.isEnabled) return
    const ctx = this.initAudioContext()
    const now = ctx.currentTime

    // Som de pulso digital suave
    const osc1 = ctx.createOscillator()
    const osc2 = ctx.createOscillator()
    const gain = ctx.createGain()
    const filter = ctx.createBiquadFilter()

    osc1.type = 'sine'
    osc1.frequency.setValueAtTime(800, now)
    osc1.frequency.exponentialRampToValueAtTime(1200, now + 0.05)

    osc2.type = 'triangle'
    osc2.frequency.setValueAtTime(1600, now)

    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(3000, now)
    filter.Q.setValueAtTime(0.5, now)

    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(this.volume * 0.4, now + 0.005)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08)

    osc1.connect(filter)
    osc2.connect(filter)
    filter.connect(gain)
    gain.connect(ctx.destination)

    osc1.start(now)
    osc2.start(now)
    osc1.stop(now + 0.08)
    osc2.stop(now + 0.08)
  }

  // Som de sucesso/confirmação - tecnologia moderna
  success() {
    if (!this.isEnabled) return
    const ctx = this.initAudioContext()
    const now = ctx.currentTime

    // Harmônicos ascendentes suaves
    const frequencies = [600, 800, 1000]
    frequencies.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      const filter = ctx.createBiquadFilter()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, now)
      osc.frequency.linearRampToValueAtTime(freq * 1.2, now + 0.15)

      filter.type = 'bandpass'
      filter.frequency.setValueAtTime(freq, now)
      filter.Q.setValueAtTime(1, now)

      gain.gain.setValueAtTime(0, now + i * 0.03)
      gain.gain.linearRampToValueAtTime(this.volume * 0.25, now + i * 0.03 + 0.02)
      gain.gain.linearRampToValueAtTime(this.volume * 0.25, now + i * 0.03 + 0.13)
      gain.gain.linearRampToValueAtTime(0, now + i * 0.03 + 0.15)

      osc.connect(filter)
      filter.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now + i * 0.03)
      osc.stop(now + i * 0.03 + 0.15)
    })
  }

  // Som de transição/loading - tecnologia moderna
  transition() {
    if (!this.isEnabled) return
    const ctx = this.initAudioContext()
    const now = ctx.currentTime

    // Sweep de frequência suave
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    const filter = ctx.createBiquadFilter()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(300, now)
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.4)

    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(1000, now)
    filter.frequency.linearRampToValueAtTime(2000, now + 0.4)
    filter.Q.setValueAtTime(0.7, now)

    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(this.volume * 0.2, now + 0.05)
    gain.gain.linearRampToValueAtTime(this.volume * 0.2, now + 0.35)
    gain.gain.linearRampToValueAtTime(0, now + 0.4)

    osc.connect(filter)
    filter.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + 0.4)
  }

  // Som de notificação/alert
  notification() {
    if (!this.isEnabled) return
    this.createTone(800, 0.15, 'sine', this.volume * 0.5)
    setTimeout(() => {
      this.createTone(1000, 0.15, 'sine', this.volume * 0.5)
    }, 100)
  }

  // Som de erro
  error() {
    if (!this.isEnabled) return
    const ctx = this.initAudioContext()
    const now = ctx.currentTime

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    const filter = ctx.createBiquadFilter()

    osc.type = 'square'
    osc.frequency.setValueAtTime(300, now)
    osc.frequency.exponentialRampToValueAtTime(150, now + 0.2)

    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(1000, now)

    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(this.volume * 0.7, now + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2)

    osc.connect(filter)
    filter.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + 0.2)
  }

  // Som de partícula/interação - tecnologia moderna
  particle() {
    if (!this.isEnabled) return
    const ctx = this.initAudioContext()
    const now = ctx.currentTime

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    const filter = ctx.createBiquadFilter()

    const freq = 1000 + Math.random() * 500
    osc.type = 'sine'
    osc.frequency.setValueAtTime(freq, now)

    filter.type = 'bandpass'
    filter.frequency.setValueAtTime(freq, now)
    filter.Q.setValueAtTime(3, now)

    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(this.volume * 0.1, now + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06)

    osc.connect(filter)
    filter.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + 0.06)
  }

  // Habilitar/desabilitar sons
  setEnabled(enabled: boolean) {
    this.isEnabled = enabled
  }

  // Ajustar volume
  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume))
  }
}

export const soundEffects = new SoundManager()

// Inicializar após primeira interação do usuário
let initialized = false
const initSound = () => {
  if (!initialized) {
    initialized = true
    document.removeEventListener('click', initSound)
    document.removeEventListener('touchstart', initSound)
    document.removeEventListener('keydown', initSound)
  }
}

document.addEventListener('click', initSound, { once: true })
document.addEventListener('touchstart', initSound, { once: true })
document.addEventListener('keydown', initSound, { once: true })

