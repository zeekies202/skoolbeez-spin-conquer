import { useEffect, useRef } from 'react'
import { useCopy } from '../../utils/language'

export default function NewGameDialog({ open, onCancel, onConfirm }) {
  const dialogRef = useRef(null)
  const text = useCopy()

  useEffect(() => {
    if (!open) return undefined
    dialogRef.current?.focus()
    function onKeyDown(event) {
      if (event.key !== 'Escape') return
      event.preventDefault()
      event.stopPropagation()
      onCancel()
    }
    window.addEventListener('keydown', onKeyDown, true)
    return () => window.removeEventListener('keydown', onKeyDown, true)
  }, [open, onCancel])

  if (!open) return null

  return (
    <div className="modal-backdrop session-backdrop">
      <div
        className="modal-card session-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="session-heading"
        tabIndex={-1}
        ref={dialogRef}
      >
        <p className="question-kicker">Spin & Conquer</p>
        <h2 id="session-heading">{text.resetTitle}</h2>
        <p className="session-copy">{text.resetBody}</p>
        <div className="session-actions">
          <button type="button" className="back-button" onClick={onCancel}>
            {text.cancel}
          </button>
          <button type="button" className="continue-button" onClick={onConfirm}>
            {text.reset}
          </button>
        </div>
      </div>
    </div>
  )
}
