let context: AudioContext | null = null

function audio(): AudioContext | null {
  if (typeof window === 'undefined') return null
  const Ctx = window.AudioContext ?? (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctx) return null
  if (!context) context = new Ctx()
  if (context.state === 'suspended') void context.resume()
  return context
}

function blip(frequency: number, duration: number, when: number, gain: number, type: OscillatorType) {
  const ctx = audio()
  if (!ctx) return
  const osc = ctx.createOscillator()
  const amp = ctx.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(frequency, ctx.currentTime + when)
  amp.gain.setValueAtTime(gain, ctx.currentTime + when)
  amp.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + when + duration)
  osc.connect(amp)
  amp.connect(ctx.destination)
  osc.start(ctx.currentTime + when)
  osc.stop(ctx.currentTime + when + duration)
}

export function playAnswer(correct: boolean, muted: boolean) {
  if (muted) return
  if (correct) {
    blip(523, 0.09, 0, 0.05, 'sine')
    blip(784, 0.14, 0.08, 0.05, 'sine')
  } else {
    blip(196, 0.16, 0, 0.04, 'triangle')
  }
  const vibrate = navigator.vibrate?.bind(navigator)
  if (!vibrate) return
  vibrate(correct ? 12 : [10, 30, 10])
}

export function playClear(muted: boolean) {
  if (muted) return
  blip(523, 0.08, 0, 0.04, 'sine')
  blip(659, 0.08, 0.09, 0.04, 'sine')
  blip(784, 0.18, 0.18, 0.05, 'sine')
}
