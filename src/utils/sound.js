export function playVictorySound(src) {
  if (!src) return
  const audio = new Audio(src)
  audio.play().catch(() => {})
}
