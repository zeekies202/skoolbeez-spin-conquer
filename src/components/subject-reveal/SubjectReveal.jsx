const ICONS = {
  sejarah: (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <rect x="14" y="10" width="36" height="44" rx="4" fill="#fff4d2" />
      <path d="M22 22h20M22 30h20M22 38h12" stroke="#7a4b00" strokeWidth="3" strokeLinecap="round" />
    </svg>
  ),
  'bahasa-melayu': (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <path d="M12 16h18c6 0 10 4 10 10v24H22c-6 0-10-4-10-10V16z" fill="#fff8e8" />
      <path d="M40 16h12v34H30" fill="#ffe08a" />
      <path d="M20 26h12M20 34h12" stroke="#7a4b00" strokeWidth="3" strokeLinecap="round" />
    </svg>
  ),
  sains: (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <path d="M26 8h12v14l12 22a12 12 0 0 1-10 18H24a12 12 0 0 1-10-18l12-22V8z" fill="#e9fff1" />
      <path d="M24 36h16" stroke="#0d6b30" strokeWidth="3" strokeLinecap="round" />
    </svg>
  ),
  matematik: (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <rect x="12" y="8" width="40" height="48" rx="6" fill="#f4ecff" />
      <rect x="18" y="14" width="28" height="10" rx="2" fill="#7a3ff0" />
      <circle cx="24" cy="36" r="3" fill="#3d2500" />
      <circle cx="32" cy="36" r="3" fill="#3d2500" />
      <circle cx="40" cy="36" r="3" fill="#3d2500" />
      <circle cx="24" cy="46" r="3" fill="#3d2500" />
      <circle cx="32" cy="46" r="3" fill="#3d2500" />
      <circle cx="40" cy="46" r="3" fill="#3d2500" />
    </svg>
  ),
  english: (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <text x="32" y="42" textAnchor="middle" fontSize="22" fontWeight="800" fill="#eaf3ff" fontFamily="Trebuchet MS, sans-serif">
        ABC
      </text>
    </svg>
  ),
}

const CONFETTI = [
  ['8%', '#e23d2b', '0s'],
  ['16%', '#f0b400', '0.08s'],
  ['24%', '#1fa84a', '0.16s'],
  ['33%', '#7a3ff0', '0.04s'],
  ['42%', '#1d6fe8', '0.2s'],
  ['51%', '#ffe08a', '0.1s'],
  ['60%', '#e23d2b', '0.18s'],
  ['69%', '#f0b400', '0.02s'],
  ['78%', '#1fa84a', '0.14s'],
  ['88%', '#7a3ff0', '0.22s'],
]

export default function SubjectReveal({
  subject,
  questions = [],
  answeredIds = [],
  celebrate = false,
  onSpinQuestion,
}) {
  if (!subject) return null
  const answered = new Set(answeredIds)

  return (
    <div className="reveal-backdrop">
      {celebrate && (
        <div className="confetti" aria-hidden="true">
          {CONFETTI.map(([left, color, delay]) => (
            <span key={left} style={{ left, background: color, animationDelay: delay }} />
          ))}
        </div>
      )}
      <article
        className="subject-card"
        style={{ '--subject-color': subject.color }}
        role="status"
        aria-live="polite"
      >
        <p className="reveal-kicker">SUBJEK TERPILIH!</p>
        <div className="subject-icon">{ICONS[subject.id]}</div>
        <h2>{subject.name}</h2>
        <ul className="subject-questions">
          {questions.map((question) => {
            const used = answered.has(question.id)
            if (used) {
              return (
                <li key={question.id}>
                  <button type="button" className="subject-question is-grey" disabled>
                    {question.question}
                  </button>
                </li>
              )
            }
            return (
              <li key={question.id}>
                <p className="subject-question">{question.question}</p>
              </li>
            )
          })}
        </ul>
        <button type="button" className="continue-button" onClick={onSpinQuestion}>
          Spin soalan
        </button>
      </article>
    </div>
  )
}
