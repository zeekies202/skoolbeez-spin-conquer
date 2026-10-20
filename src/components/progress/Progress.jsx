import { assets } from '../../data/assets'
import { subjects } from '../../data/subjects'
import { isSubjectComplete, questionsForSubject } from '../../utils/game'
import CutoutImage from '../layout/CutoutImage'

export default function Progress({ answeredIds }) {
  const answered = new Set(answeredIds)

  return (
    <aside className="progress-panel" aria-label="Question progress">
      <div className="crown-crop">
        <CutoutImage src={assets.progressPanel} mode="white" alt="" />
      </div>
      <h2>Questions</h2>
      <ol className="progress-list">
        {subjects.map((subject) => {
          const items = questionsForSubject(subject.id)
          const complete = isSubjectComplete(subject.id, answeredIds)
          return (
            <li key={subject.id} className={complete ? 'is-complete' : undefined}>
              <div className="progress-label">
                <span className="swatch" style={{ background: subject.color }} />
                <span>{subject.name}</span>
              </div>
              <div className="slots">
                {items.map((question, index) => {
                  const done = answered.has(question.id)
                  return (
                    <span
                      key={question.id}
                      className={done ? 'slot is-grey' : 'slot'}
                      style={done ? undefined : { background: subject.color }}
                      aria-disabled={done ? 'true' : undefined}
                      title={`${subject.name} question ${index + 1}${done ? ' answered' : ''}`}
                    >
                      {index + 1}
                    </span>
                  )
                })}
              </div>
            </li>
          )
        })}
      </ol>
    </aside>
  )
}
