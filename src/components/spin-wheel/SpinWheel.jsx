import { useEffect, useRef, useState } from 'react'
import { timings } from '../../data/timings'
import { assets } from '../../data/assets'
import { useWheelDisc, useWheelStand } from '../../hooks/useWheelStand'
import CutoutImage from '../layout/CutoutImage'

const partyBits = [
  ['#ffe08a', '4%', '0s'],
  ['#7ec8ff', '9%', '0.05s'],
  ['#ff8ad4', '14%', '0.1s'],
  ['#b794f6', '7%', '0.02s'],
  ['#8affc1', '12%', '0.08s'],
  ['#fff6c8', '5%', '0.14s'],
  ['#ffd056', '16%', '0.16s'],
  ['#fff', '10%', '0.2s'],
]

function QuestionDisc({
  questionSpinning,
  questionRotation,
  questions,
  answeredIds,
  onQuestionSpinEnd,
}) {
  const [enter, setEnter] = useState(true)

  return (
    <div className="question-rotor">
      <div
        className={
          questionSpinning ? 'question-spin is-spinning' : enter ? 'question-spin is-enter' : 'question-spin'
        }
        style={{
          '--question-turn': `${questionRotation}deg`,
          transition: questionSpinning
            ? `--question-turn ${timings.questionSpinSeconds}s cubic-bezier(0.16, 0.42, 0.12, 1)`
            : 'none',
        }}
        onAnimationEnd={(event) => {
          if (event.target === event.currentTarget && event.animationName === 'disc-fill') setEnter(false)
        }}
        onTransitionEnd={onQuestionSpinEnd}
      >
        <img className="question-numbers" src={assets.questionNumbers} alt="" draggable="false" />
        {questions.map((question, index) =>
          answeredIds.includes(question.id) ? (
            <img
              key={question.id}
              className="question-numbers is-grey"
              src={assets.questionNumbers}
              alt=""
              draggable="false"
              data-number={index + 1}
              aria-disabled="true"
            />
          ) : null,
        )}
      </div>
    </div>
  )
}

export default function SpinWheel({
  rotation,
  spinDuration,
  spinning,
  answeredIds,
  disabled,
  onSpin,
  onSpinEnd,
  buttonLabel,
  subject,
  questions,
  questionRotation,
  questionSpinning,
  onQuestionSpinEnd,
}) {
  const standUrl = useWheelStand(assets.wheelStand)
  const questionStandUrl = useWheelStand(assets.questionStand)
  const subjectUrl = useWheelDisc(assets.wheelSubjects)
  const showQuestions = Boolean(subject) && questions.length > 0
  const [impact, setImpact] = useState(false)
  const wasSpinning = useRef(false)

  useEffect(() => {
    if (spinning) {
      wasSpinning.current = true
      return undefined
    }
    if (!wasSpinning.current) return undefined
    wasSpinning.current = false
    setImpact(true)
    const timer = window.setTimeout(() => setImpact(false), 1400)
    return () => window.clearTimeout(timer)
  }, [spinning])

  const stageClass = [
    'wheel-stage',
    showQuestions ? 'is-questions' : '',
    spinning || questionSpinning ? 'is-live' : '',
    impact ? 'is-hit' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className="wheel-column">
      <div className={stageClass}>
        <div
          className={spinning && !questionSpinning ? 'subject-rotor is-spinning' : 'subject-rotor'}
          style={{
            '--wheel-rotation': `${rotation}deg`,
            '--spin-duration': `${spinDuration}s`,
          }}
          onTransitionEnd={onSpinEnd}
        >
          {subjectUrl ? (
            <img src={subjectUrl} alt="Subject spin wheel" draggable="false" />
          ) : null}
        </div>
        {showQuestions ? (
          <QuestionDisc
            questionSpinning={questionSpinning}
            questionRotation={questionRotation}
            questions={questions}
            answeredIds={answeredIds}
            onQuestionSpinEnd={onQuestionSpinEnd}
          />
        ) : null}
        {standUrl ? (
          <img className="wheel-stand is-subject" src={standUrl} alt="" draggable="false" />
        ) : null}
        {questionStandUrl ? (
          <img
            className="wheel-stand is-question"
            src={questionStandUrl}
            alt=""
            draggable="false"
          />
        ) : null}
        {impact ? (
          <div className="party-cannon" aria-hidden="true">
            {partyBits.map(([color, edge, delay]) => (
              <span key={`l-${edge}`} style={{ left: edge, background: color, animationDelay: delay }} />
            ))}
            {partyBits.map(([color, edge, delay]) => (
              <span key={`r-${edge}`} className="is-right" style={{ right: edge, background: color, animationDelay: delay }} />
            ))}
          </div>
        ) : null}
        {impact ? (
          <div className="star-fountain" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>
        ) : null}
      </div>
      <button type="button" className="spin-button" onClick={onSpin} disabled={disabled}>
        <CutoutImage src={assets.playButton} mode="white" alt="" />
        <span>{buttonLabel}</span>
      </button>
    </div>
  )
}
