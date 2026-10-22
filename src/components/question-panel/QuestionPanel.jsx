import { useCopy } from '../../utils/language'

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

          return (
            <button
              key={`${question.id}-${index}`}
              type="button"
              className={`option ${state}`.trim()}
              onClick={() => onSelect(index)}
              disabled={confirmed || isWrong}
              aria-pressed={isSelected}
            >
              <span className="option-letter">{String.fromCharCode(65 + index)}</span>
              <span>{option}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
