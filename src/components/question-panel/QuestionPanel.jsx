import { useCopy } from '../../utils/language'

function hasFraction(value) {
  return /\d+\/\d+/.test(value)
}

function OptionText({ value }) {
  const pieces = []
  let cursor = 0

  for (const match of value.matchAll(/(\d+)\/(\d+)/g)) {
    const [token, numerator, denominator] = match
    if (match.index > cursor) pieces.push(value.slice(cursor, match.index))
    pieces.push(
      <span key={`${match.index}-${token}`} className="fraction">
        <span className="sr-only">{token}</span>
        <span className="fraction-num" aria-hidden="true">{numerator}</span>
        <span className="fraction-bar" aria-hidden="true" />
        <span className="fraction-den" aria-hidden="true">{denominator}</span>
      </span>,
    )
    cursor = match.index + token.length
  }

  if (pieces.length === 0) return value
  if (cursor < value.length) pieces.push(value.slice(cursor))
  return pieces
}

export default function QuestionPanel({
  question,
  subject,
  selectedIndex,
  wrongIndexes = [],
  confirmed = false,
  onSelect,
}) {
  const text = useCopy()

  return (
    <div className={confirmed ? 'question-panel is-confirmed' : 'question-panel'}>
      <p className="question-kicker" style={{ color: subject.color }}>
        {text.subjectName(subject.id)}
      </p>
      <h2 id="quiz-heading">{question.question}</h2>
      <div className="options" role="group" aria-label={text.answerOptions}>
        {question.options.map((option, index) => {
          const isCorrect = confirmed && index === question.correctIndex
          const isWrong = wrongIndexes.includes(index)
          const isSelected = index === selectedIndex
          const state = isCorrect ? 'is-correct' : isWrong ? 'is-wrong' : ''
          const showFraction = subject.id === 'matematik' && hasFraction(option)

          return (
            <button
              key={`${question.id}-${index}`}
              type="button"
              className={`option ${showFraction ? 'has-fraction' : ''} ${state}`.trim()}
              onClick={() => onSelect(index)}
              disabled={confirmed || isWrong}
              aria-pressed={isSelected}
            >
              <span className="option-letter">{String.fromCharCode(65 + index)}</span>
              <span>{showFraction ? <OptionText value={option} /> : option}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
