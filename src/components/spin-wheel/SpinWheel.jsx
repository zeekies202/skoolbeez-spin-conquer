import { useEffect, useRef, useState } from 'react'
import { timings } from '../../data/timings'
import { assets } from '../../data/assets'
import { subjects } from '../../data/subjects'
import { isSubjectComplete } from '../../utils/game'
import { useWheelDisc, useWheelStand } from '../../hooks/useWheelStand'
import CutoutImage from '../layout/CutoutImage'

const lights = Array.from({ length: 12 }, (_, index) => index)
const twinkles = Array.from({ length: 8 }, (_, index) => index)
const embers = Array.from({ length: 7 }, (_, index) => index)

const partyBits = [
  ['#ffe08a', '6%', '0s'],
  ['#7ec8ff', '11%', '0.06s'],
  ['#ff8ad4', '15%', '0.12s'],
  ['#b794f6', '9%', '0.04s'],
  ['#8affc1', '13%', '0.1s'],
  ['#fff6c8', '7%', '0.16s'],
]

const hexes = Array.from({ length: 10 }, (_, index) => index)

const bursts = Array.from({ length: 10 }, (_, index) => {
  const angle = (index / 10) * Math.PI * 2 - Math.PI / 2
  return {
    top: `${39.1 + Math.sin(angle) * 27}%`,
    left: `${49.8 + Math.cos(angle) * 27}%`,
    x: `${(Math.cos(angle) * 72).toFixed(1)}px`,
    y: `${(Math.sin(angle) * 72).toFixed(1)}px`,
  }
})

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
          {subjects.map((item) =>
            isSubjectComplete(item.id, answeredIds) ? (
              <span
                key={item.id}
                className="segment-spent"
                style={{ '--segment-angle': `${item.angle}deg` }}
              />
            ) : null,
          )}
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
        {standUrl ? <img className="wheel-stand" src={standUrl} alt="" draggable="false" /> : null}
        {spinning || questionSpinning ? (
          <>
            <div className="wheel-embers" aria-hidden="true">
              {embers.map((ember) => (
                <span key={ember} style={{ '--i': ember }} />
              ))}
            </div>
            <div className="wheel-comet" aria-hidden="true">
              <span />
            </div>
            <div className="hex-pop" aria-hidden="true">
              {hexes.map((hex) => (
                <span key={hex} style={{ '--i': hex }} />
              ))}
            </div>
          </>
        ) : null}
        {spinning || questionSpinning ? (
          <div className="wheel-orbit" aria-hidden="true">
            {lights.map((light) => (
              <span key={light} style={{ '--i': light }} />
            ))}
          </div>
        ) : (
          <div className="wheel-twinkle" aria-hidden="true">
            {twinkles.map((light) => (
              <span key={light} style={{ '--i': light }} />
            ))}
          </div>
        )}
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
          <div className="finale-pop" aria-hidden="true">
            <i><span /><span /><span /><span /><span /><span /><span /><span /></i>
            <i><span /><span /><span /><span /><span /><span /><span /><span /></i>
            <i><span /><span /><span /><span /><span /><span /><span /><span /></i>
          </div>
        ) : null}
        {impact ? (
          <div className="star-fountain" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>
        ) : null}
        {impact ? (
          <div className="wheel-impact" aria-hidden="true">
            {bursts.map((spark) => (
              <span
                key={`${spark.left}-${spark.top}`}
                style={{
                  top: spark.top,
                  left: spark.left,
                  '--burst-x': spark.x,
                  '--burst-y': spark.y,
                }}
              />
            ))}
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
