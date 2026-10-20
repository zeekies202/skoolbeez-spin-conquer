const MUSIC_VOLUME = 0.1
const SFX_VOLUME = 0.85

const listeners = new Set()
let context = null
let masterGain = null
let musicGain = null
let sfxGain = null
let musicSource = null
let tekBuffer = null
let spinTimer = 0
let spinToken = 0
let spinActive = false
let muted = false
let unlocked = false
let armed = false
let musicBuffer = null
let lastCue = ''

function emit() {
  listeners.forEach((listener) => listener())
}

export function subscribeAudio(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function isMuted() {
  return muted
}

export function getAudioStatus() {
  return {
    muted,
    context: context ? context.state : 'none',
    spinning: spinActive,
    music: Boolean(musicSource),
    musicVolume: MUSIC_VOLUME,
    sfxVolume: SFX_VOLUME,
    lastCue,
  }
}

function ensureContext() {
  if (context) return context
  const AudioCtx = window.AudioContext || window.webkitAudioContext
  if (!AudioCtx) return null
  context = new AudioCtx()
  masterGain = context.createGain()
  musicGain = context.createGain()
  sfxGain = context.createGain()
  masterGain.gain.value = muted ? 0 : 1
  musicGain.gain.value = MUSIC_VOLUME
  sfxGain.gain.value = SFX_VOLUME
  musicGain.connect(masterGain)
  sfxGain.connect(masterGain)
  masterGain.connect(context.destination)
  return context
}

function resumeContext() {
  const ctx = ensureContext()
  if (ctx && ctx.state === 'suspended') {
    ctx.resume().catch(() => {})
  }
  return ctx
}

function writePluck(data, rate, start, duration, frequency, peak) {
  const from = Math.floor(start * rate)
  const to = Math.min(data.length, Math.floor((start + duration) * rate))
  for (let index = from; index < to; index += 1) {
    const time = (index - from) / rate
    const attack = Math.min(1, time / 0.012)
    const envelope = attack * Math.exp(-time * 3.4)
    const tone = Math.sin(2 * Math.PI * frequency * time) + Math.sin(2 * Math.PI * frequency * 2.01 * time) * 0.12
    data[index] += tone * envelope * peak
  }
}

function writePad(data, rate, start, duration, frequency, peak) {
  const from = Math.floor(start * rate)
  const to = Math.min(data.length, Math.floor((start + duration) * rate))
  for (let index = from; index < to; index += 1) {
    const time = (index - from) / rate
    const edge = Math.min(1, time / 0.35, Math.max(0, duration - time) / 0.4)
    data[index] += Math.sin(2 * Math.PI * frequency * time) * edge * peak
  }
}

function createMusicBuffer(ctx) {
  const rate = ctx.sampleRate
  const seconds = 8
  const data = new Float32Array(Math.floor(rate * seconds))
  const melody = [
    [0, 329.63, 0.28, 0.09],
    [0.32, 392, 0.28, 0.08],
    [0.64, 523.25, 0.42, 0.09],
    [1.2, 493.88, 0.28, 0.07],
    [1.52, 440, 0.28, 0.07],
    [1.84, 392, 0.42, 0.08],
    [2.4, 440, 0.28, 0.08],
    [2.72, 392, 0.28, 0.07],
    [3.04, 329.63, 0.46, 0.08],
    [3.6, 349.23, 0.28, 0.07],
    [3.92, 440, 0.28, 0.08],
    [4.24, 523.25, 0.42, 0.08],
    [4.8, 587.33, 0.28, 0.07],
    [5.12, 523.25, 0.28, 0.07],
    [5.44, 440, 0.42, 0.08],
    [6, 392, 0.28, 0.07],
    [6.32, 329.63, 0.28, 0.07],
    [6.64, 293.66, 0.42, 0.07],
    [7.2, 261.63, 0.7, 0.08],
  ]
  melody.forEach(([start, frequency, duration, peak]) => {
    writePluck(data, rate, start, duration, frequency, peak)
  })
  writePad(data, rate, 0, 8, 261.63, 0.028)
  writePad(data, rate, 0, 8, 329.63, 0.02)
  writePad(data, rate, 0, 8, 392, 0.016)
  for (let beat = 0; beat < 6; beat += 1) {
    writePluck(data, rate, beat * 1.2, 0.35, beat % 2 === 0 ? 130.81 : 98, 0.05)
  }
  const buffer = ctx.createBuffer(1, data.length, rate)
  buffer.copyToChannel(data, 0)
  return buffer
}

function createTekBuffer(ctx) {
  const rate = ctx.sampleRate
  const length = Math.floor(rate * 0.04)
  const data = new Float32Array(length)
  for (let index = 0; index < length; index += 1) {
    const time = index / rate
    const envelope = Math.exp(-time * 95)
    const tone = Math.sin(2 * Math.PI * 740 * time) + Math.sin(2 * Math.PI * 1480 * time) * 0.28
    data[index] = tone * envelope * 0.42
  }
  const buffer = ctx.createBuffer(1, length, rate)
  buffer.copyToChannel(data, 0)
  return buffer
}

function playBuffer(buffer) {
  if (!context || !buffer || !sfxGain) return
  const source = context.createBufferSource()
  source.buffer = buffer
  source.connect(sfxGain)
  source.start()
}

export function startMusic() {
  const ctx = resumeContext()
  if (!ctx || muted || musicSource || !unlocked) return
  if (!musicBuffer) musicBuffer = createMusicBuffer(ctx)
  const source = ctx.createBufferSource()
  source.buffer = musicBuffer
  source.loop = true
  source.connect(musicGain)
  source.start()
  musicSource = source
  source.onended = () => {
    if (musicSource === source) musicSource = null
  }
}

export function pauseMusic() {
  if (!musicSource) return
  const source = musicSource
  musicSource = null
  try {
    source.stop()
  } catch {
    /* already stopped */
  }
  source.disconnect()
}

export function startSpin(seconds = 6) {
  stopSpin()
  const ctx = resumeContext()
  if (!ctx || !unlocked) return
  if (!tekBuffer) tekBuffer = createTekBuffer(ctx)
  const token = spinToken
  const started = performance.now()
  const total = Math.max(1, seconds) * 1000
  spinActive = true
  lastCue = 'spin'
  const nextTek = () => {
    if (token !== spinToken) return
    const elapsed = performance.now() - started
    if (elapsed >= total) {
      stopSpin()
      return
    }
    playBuffer(tekBuffer)
    const progress = elapsed / total
    const gap = 42 + 540 * progress ** 2.6
    spinTimer = window.setTimeout(nextTek, gap)
  }
  nextTek()
}

export function playWheelStop() {
  stopSpin()
  if (!unlocked || muted) return
  lastCue = 'ding'
  playTone(1174.66, 0, 0.2, 'sine', 0.15)
  playTone(1567.98, 0.045, 0.26, 'triangle', 0.09)
}

export function stopSpin() {
  spinToken += 1
  spinActive = false
  window.clearTimeout(spinTimer)
  spinTimer = 0
}

function duckMusic(seconds) {
  if (!context || !musicGain || muted) return
  const now = context.currentTime
  const quietUntil = now + seconds
  musicGain.gain.cancelScheduledValues(now)
  musicGain.gain.setValueAtTime(Math.max(musicGain.gain.value, 0.0001), now)
  musicGain.gain.linearRampToValueAtTime(0.02, now + 0.05)
  musicGain.gain.setValueAtTime(0.02, quietUntil)
  musicGain.gain.linearRampToValueAtTime(MUSIC_VOLUME, quietUntil + 0.28)
}

function stopKidVoices() {
  window.speechSynthesis?.cancel()
}

function playTone(frequency, delay, duration, type, peak) {
  const ctx = resumeContext()
  if (!ctx || !unlocked) return
  const when = ctx.currentTime + delay
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(frequency, when)
  gain.gain.setValueAtTime(0.0001, when)
  gain.gain.exponentialRampToValueAtTime(peak, when + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.0001, when + duration)
  osc.connect(gain)
  gain.connect(sfxGain)
  osc.start(when)
  osc.stop(when + duration + 0.02)
}

function playBoing() {
  const ctx = resumeContext()
  if (!ctx || !sfxGain) return
  const now = ctx.currentTime
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(460, now)
  osc.frequency.exponentialRampToValueAtTime(150, now + 0.14)
  osc.frequency.exponentialRampToValueAtTime(250, now + 0.24)
  osc.frequency.exponentialRampToValueAtTime(96, now + 0.4)
  gain.gain.setValueAtTime(0.0001, now)
  gain.gain.exponentialRampToValueAtTime(0.12, now + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.42)
  osc.connect(gain)
  gain.connect(sfxGain)
  osc.start(now)
  osc.stop(now + 0.46)
}

export function playCorrect() {
  lastCue = 'chime'
  stopKidVoices()
  duckMusic(0.7)
  playTone(523.25, 0, 0.22, 'triangle', 0.14)
  playTone(659.25, 0.09, 0.22, 'triangle', 0.13)
  playTone(783.99, 0.18, 0.24, 'triangle', 0.12)
  playTone(1046.5, 0.28, 0.32, 'sine', 0.11)
}

export function playWrong() {
  lastCue = 'boing'
  stopKidVoices()
  duckMusic(0.5)
  playBoing()
}

export function playFanfare() {
  if (!unlocked || muted) return
  lastCue = 'fanfare'
  stopKidVoices()
  duckMusic(1.3)
  ;[523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5, 1318.51].forEach((frequency, index, notes) => {
    playTone(frequency, index * 0.11, 0.26, 'triangle', index === notes.length - 1 ? 0.15 : 0.11)
  })
}

export function setMuted(next) {
  muted = Boolean(next)
  if (context && masterGain) {
    masterGain.gain.setValueAtTime(muted ? 0 : 1, context.currentTime)
  }
  if (muted) {
    pauseMusic()
    stopKidVoices()
  } else if (unlocked) startMusic()
  emit()
}

export function toggleMuted() {
  unlocked = true
  resumeContext()
  setMuted(!muted)
}

function unlockFromGesture(event) {
  unlocked = true
  resumeContext()
  const muteButton = event.target instanceof Element && event.target.closest('.sound-toggle')
  if (!muteButton) startMusic()
  window.removeEventListener('pointerdown', unlockFromGesture)
  window.removeEventListener('keydown', unlockFromGesture)
}

export function armAudio() {
  if (armed) return
  armed = true
  window.addEventListener('pointerdown', unlockFromGesture)
  window.addEventListener('keydown', unlockFromGesture)
  if (import.meta.hot) {
    import.meta.hot.dispose(() => {
      stopSpin()
      pauseMusic()
      stopKidVoices()
      if (context) context.close().catch(() => {})
    })
  }
  window.addEventListener('pagehide', () => {
    stopSpin()
    pauseMusic()
    stopKidVoices()
  })
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      stopSpin()
      pauseMusic()
      stopKidVoices()
      return
    }
    if (!muted && unlocked) startMusic()
  })
}
