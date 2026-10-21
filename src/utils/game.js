import { questions } from '../data/questions'
import { subjects } from '../data/subjects'

export const TOTAL_QUESTIONS = questions.length

function mod(value) {
  return ((value % 360) + 360) % 360
}

const numberCenters = [315, 45, 225, 135]

export function questionSegmentAngle(index, count) {
  if (count === 4 && numberCenters[index] != null) return numberCenters[index]
  if (count <= 0) return 0
  return index * (360 / count)
}

export function nextQuestionRotation(current, index, count) {
  const segment = count > 0 ? 360 / count : 360
  const center = questionSegmentAngle(index, count)
  const jitter = (Math.random() - 0.5) * Math.min(24, segment * 0.35)
  const desired = mod(360 - center + jitter)
  const currentMod = mod(current)
  let delta = desired - currentMod
  if (delta < 0) delta += 360
  return current + 4 * 360 + delta
}

export function nextRotation(current, segmentAngle) {
  const fullTurns = 6 + Math.floor(Math.random() * 3)
  const jitter = (Math.random() - 0.5) * 18
  const desired = mod(360 - segmentAngle + jitter)
  const currentMod = mod(current)
  let delta = desired - currentMod
  if (delta < 0) delta += 360
  return current + fullTurns * 360 + delta
}

export function questionsForSubject(subjectId) {
  return questions.filter((question) => question.subjectId === subjectId)
}

export function availableSubjects(answeredIds) {
  const answered = new Set(answeredIds)
  return subjects.filter((subject) =>
    questions.some(
      (question) => question.subjectId === subject.id && !answered.has(question.id),
    ),
  )
}

export function withShuffledOptions(question) {
  const order = question.options.map((_, index) => index)
  for (let i = order.length - 1; i > 0; i -= 1) {
    const swap = Math.floor(Math.random() * (i + 1))
    const current = order[i]
    order[i] = order[swap]
    order[swap] = current
  }
  return {
    ...question,
    options: order.map((index) => question.options[index]),
    correctIndex: order.indexOf(question.correctIndex),
  }
}

export function pickQuestion(subjectId, answeredIds) {
  const answered = new Set(answeredIds)
  const pool = questions.filter(
    (question) => question.subjectId === subjectId && !answered.has(question.id),
  )
  if (pool.length === 0) return null
  return pool[Math.floor(Math.random() * pool.length)]
}

export function isSubjectComplete(subjectId, answeredIds) {
  const answered = new Set(answeredIds)
  const items = questionsForSubject(subjectId)
  return items.length > 0 && items.every((question) => answered.has(question.id))
}
