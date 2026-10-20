import { useEffect, useSyncExternalStore } from 'react'
import { armAudio, isMuted, subscribeAudio, toggleMuted } from '../../utils/gameAudio'
import { useCopy } from '../../utils/language'

export default function SoundToggle() {
  const muted = useSyncExternalStore(subscribeAudio, isMuted)
  const text = useCopy()

  useEffect(() => {
    armAudio()
  }, [])

  return (
    <button
      type="button"
      className="sound-toggle"
      aria-pressed={muted}
      aria-label={muted ? text.unmute : text.mute}
      onClick={toggleMuted}
    >
      {muted ? (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 9h3.2L12 5.2v13.6L7.2 15H4V9z" />
          <path d="M16 9.5l4.5 5M20.5 9.5L16 14.5" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 9h3.2L12 5.2v13.6L7.2 15H4V9z" />
          <path d="M15.2 8.4a4.2 4.2 0 0 1 0 7.2M17.6 6a7 7 0 0 1 0 12" />
        </svg>
      )}
    </button>
  )
}
