import { useCopy } from '../../utils/language'

export default function QuestionPanel({
  question,
  subject,
  selectedIndex,
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
          const isCorrect = index === question.correctIndex
          const isSelected = index === selectedIndex
          const state = confirmed
            ? isCorrect
              ? 'is-correct'
              : isSelected
                ? 'is-wrong'
                : ''
            : isSelected
              ? 'is-picked'
              : ''

          return (
            <button
              key={`${question.id}-${index}`}
              type="button"
              className={`option ${state}`.trim()}
              onClick={() => onSelect(index)}
              disabled={confirmed}
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
