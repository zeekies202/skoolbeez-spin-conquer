import { useEffect, useRef } from 'react'
import { assets } from '../../data/assets'
import { useCopy } from '../../utils/language'
import Buzzy from '../buzzy/Buzzy'
import CutoutImage from '../layout/CutoutImage'
import QuestionPanel from '../question-panel/QuestionPanel'

function resultMessage(score, total, text) {
  if (score === total) return text.resultsPerfect
  if (score >= 15) return text.resultsHigh
  if (score >= 10) return text.resultsMid
  return text.resultsLow
}

export default function QuizModal({
  question,
  subject,
  selectedIndex,
  wrongIndexes = [],
  confirmed = false,
  answeredCount,
  total,
  showResults,
  score,
  onSelect,
  onContinue,
  onBack,
  onPlayAgain,
}) {
  const dialogRef = useRef(null)
  const text = useCopy()
  const open = showResults || Boolean(question)

  useEffect(() => {
    if (open) dialogRef.current?.focus()
  }, [open, question, showResults])

  useEffect(() => {
    if (!question) return undefined
    function onKeyDown(event) {
      if (event.key !== 'Escape') return
      if (confirmed) onContinue()
      else onBack()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [question, confirmed, onContinue, onBack])

  if (!open) return null

  const correct = question ? selectedIndex === question.correctIndex : false

  const buzzyMood = confirmed ? 'win' : wrongIndexes.length ? 'miss' : 'arrive'

  return (
    <div className={showResults ? 'modal-backdrop' : 'modal-backdrop is-question-open'}>
      {showResults ? null : <Buzzy mood={buzzyMood} variant="modal" />}
      {showResults ? null : (
        <div className="question-entrance" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
      )}
      {(correct && confirmed) || showResults ? (
        <div className="confetti" aria-hidden="true">
          {['#ffe08a', '#7a3ff0', '#1d6fe8', '#ffd56a', '#f0c14a', '#9b6bff', '#7ec8ff', '#fff1b0', '#ff8ad4', '#8affc1', '#fff', '#ffb347'].map(
            (color, index) => (
              <span
                key={`${color}-${index}`}
                className={index % 3 === 0 ? 'is-star' : undefined}
                style={{
                  left: `${4 + (index % 12) * 8}%`,
                  background: color,
                  animationDelay: `${(index % 8) * 0.06}s`,
                  animationDuration: `${3.2 + (index % 4) * 0.4}s`,
                }}
              />
            ),
          )}
        </div>
      ) : null}
      <div
        className={
          showResults
            ? 'modal-card is-results'
            : confirmed
              ? `modal-card is-question ${correct ? 'is-win' : 'is-miss'}`
              : 'modal-card is-question'
        }
        role="dialog"
        aria-modal="true"
        aria-labelledby="quiz-heading"
        tabIndex={-1}
        ref={dialogRef}
      >
        {showResults ? (
          <div className="results">
            <div className="victory-trophy" aria-hidden="true">
              <svg viewBox="0 0 64 64">
                <path d="M18 10h28v8c0 10-6 18-14 20-8-2-14-10-14-20V10z" />
                <path d="M18 14H10c0 10 4 16 10 18M46 14h8c0 10-4 16-10 18" />
                <path d="M28 38h8v8h-8zM22 50h20v6H22z" />
              </svg>
            </div>
            <div className="victory-stars" aria-hidden="true">
              {[0, 1, 2, 3, 4].map((index) => (
                <span key={index} style={{ animationDelay: `${index * 0.16}s` }} />
              ))}
            </div>
            <CutoutImage className="results-rewards" src={assets.rewards} mode="white" alt="" />
            <p className="question-kicker">Spin & Conquer</p>
            <h2 id="quiz-heading">{text.resultsTitle}</h2>
            <p className="results-score">
              <strong>{score}</strong>
              <span>
                {text.outOf} {total}
              </span>
            </p>
            <p className="results-copy">{resultMessage(score, total, text)}</p>
            <button type="button" className="spin-button results-again" onClick={onPlayAgain}>
              <CutoutImage src={assets.playButton} mode="white" alt="" />
              <span>{text.playAgain}</span>
            </button>
          </div>
        ) : (
          <>
            {confirmed ? null : (
              <button type="button" className="back-button" onClick={onBack}>
                <span aria-hidden="true">←</span>
                {text.back}
              </button>
            )}
            <QuestionPanel
              question={question}
              subject={subject}
              selectedIndex={selectedIndex}
              wrongIndexes={wrongIndexes}
              confirmed={confirmed}
              onSelect={onSelect}
            />
            {confirmed && correct ? (
              <div className="score-float" aria-hidden="true">
                <strong>+100</strong>
                {score >= 2 ? <em>COMBO x{score}</em> : null}
                <span className="correct-sparkles">
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                </span>
              </div>
            ) : null}
            {confirmed && (
              <p className="cheer-banner is-win">
                {text.cheerWin}
              </p>
            )}
            {confirmed && (
              <p className="feedback is-correct" role="status">
                {text.correct}
              </p>
            )}
            {confirmed ? (
              <button type="button" className="continue-button is-checked" onClick={onContinue}>
                {answeredCount >= total ? text.seeResults : text.continue}
              </button>
            ) : null}
          </>
        )}
      </div>
    </div>
  )
}
