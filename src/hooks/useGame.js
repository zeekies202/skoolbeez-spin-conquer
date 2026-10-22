import { useRef, useState } from 'react'
import { assets } from '../data/assets'
import { subjectById } from '../data/subjects'
import { timings } from '../data/timings'
import {
  TOTAL_QUESTIONS,
  availableSubjects,
  nextQuestionRotation,
  nextRotation,
  pickQuestion,
  questionsForSubject,
  withShuffledOptions,
} from '../utils/game'
import { playCorrect, playFanfare, playWheelStop, playWrong, startSpin, stopSpin } from '../utils/gameAudio'
import { playVictorySound } from '../utils/sound'

export function useGame() {
  const [answeredIds, setAnsweredIds] = useState([])
  const [score, setScore] = useState(0)
  const [rotation, setRotation] = useState(0)
  const [spinning, setSpinning] = useState(false)
  const [activeQuestion, setActiveQuestion] = useState(null)
  const [selectedIndex, setSelectedIndex] = useState(null)
  const [wrongIndexes, setWrongIndexes] = useState([])
  const [confirmed, setConfirmed] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [revealSubject, setRevealSubject] = useState(null)
  const [lockedSubject, setLockedSubject] = useState(null)
  const [celebrate, setCelebrate] = useState(false)
  const [notice, setNotice] = useState('')
  const [spinDuration, setSpinDuration] = useState(timings.spinSeconds)
  const [questionRotation, setQuestionRotation] = useState(0)
  const [questionSpinning, setQuestionSpinning] = useState(false)
  const [phase, setPhase] = useState('idle')
  const [confirmReset, setConfirmReset] = useState(false)
  const answeredRef = useRef([])
  const scoreRef = useRef(0)
  const sessionRef = useRef(0)
  const spinningRef = useRef(false)
  const pendingSubjectId = useRef(null)
  const pendingQuestion = useRef(null)
  const lockedSubjectRef = useRef(null)
  const spinKind = useRef('subject')
  const questionRotationRef = useRef(0)
  const questionSpinningRef = useRef(false)
  const questionSpinStarted = useRef(0)
  const returnTimer = useRef(0)

  function rememberSubject(subject) {
    lockedSubjectRef.current = subject
    setLockedSubject(subject)
    questionRotationRef.current = 0
    setQuestionRotation(0)
    questionSpinningRef.current = false
    setQuestionSpinning(false)
  }

  function clearSubject() {
    lockedSubjectRef.current = null
    setLockedSubject(null)
    setRevealSubject(null)
    setCelebrate(false)
  }

  function spin() {
    if (spinningRef.current || phase !== 'idle') return
    const choices = availableSubjects(answeredRef.current)
    if (choices.length === 0) {
      setPhase('results')
      setShowResults(true)
      if (scoreRef.current >= 15) playFanfare()
      return
    }
    const subject = choices[Math.floor(Math.random() * choices.length)]
    pendingSubjectId.current = subject.id
    pendingQuestion.current = null
    spinKind.current = 'subject'
    setNotice('')
    spinningRef.current = true
    setSpinDuration(timings.spinSeconds)
    setSpinning(true)
    setPhase('spinning')
    setRotation((current) => nextRotation(current, subject.angle))
    startSpin(timings.spinSeconds)
  }

  function releaseSubject() {
    const subject = lockedSubjectRef.current
    stopSpin()
    clearSubject()
    setNotice(subject ? subject.id : '')
    setPhase('idle')
  }

  function startQuestionSpin() {
    const subject = lockedSubjectRef.current
    if (!subject || spinningRef.current || questionSpinningRef.current) return
    const pool = questionsForSubject(subject.id)
    const question = pickQuestion(subject.id, answeredRef.current)
    if (!question) {
      releaseSubject()
      return
    }
    const index = pool.findIndex((item) => item.id === question.id)
    const target = nextQuestionRotation(questionRotationRef.current, index, pool.length)
    pendingQuestion.current = question
    spinKind.current = 'question'
    questionRotationRef.current = target
    questionSpinStarted.current = 0
    setCelebrate(false)
    setRevealSubject(null)
    setQuestionSpinning(true)
    questionSpinningRef.current = true
    spinningRef.current = true
    setSpinning(true)
    setPhase('spinning')
    const session = sessionRef.current
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        if (sessionRef.current !== session) return
        questionSpinStarted.current = performance.now()
        setQuestionRotation(target)
      })
    })
    startSpin(timings.questionSpinSeconds)
  }

  function spinQuestion() {
    if (phase !== 'subject') return
    startQuestionSpin()
  }

  function finishQuestionSpin(event) {
    const property = event.propertyName.toLowerCase()
    if (property !== '--question-turn' && !property.includes('transform')) return
    if (event.target !== event.currentTarget || !questionSpinningRef.current) return
    if (questionSpinStarted.current === 0) return
    if (performance.now() - questionSpinStarted.current < (timings.questionSpinSeconds - 0.5) * 1000) return
    playWheelStop()
    questionSpinningRef.current = false
    spinningRef.current = false
    setQuestionSpinning(false)
    setSpinning(false)
    const subject = lockedSubjectRef.current
    const question = pendingQuestion.current
    if (!subject || !question || question.subjectId !== subject.id) {
      setPhase(subject ? 'subject' : 'idle')
      return
    }
    setSelectedIndex(null)
    setWrongIndexes([])
    setConfirmed(false)
    setActiveQuestion(withShuffledOptions(question))
    setPhase('question')
  }

  function finishSpin(event) {
    if (!event.propertyName.toLowerCase().includes('transform')) return
    if (event.target !== event.currentTarget || !spinningRef.current) return
    if (spinKind.current !== 'subject') return
    playWheelStop()
    spinningRef.current = false
    setSpinning(false)
    const subject = subjectById(pendingSubjectId.current)
    if (!subject) {
      setPhase('idle')
      return
    }
    rememberSubject(subject)
    setRevealSubject(subject)
    setCelebrate(true)
    setPhase('subject')
    playVictorySound(assets.victorySound)
  }

  function selectAnswer(index) {
    if (!activeQuestion || confirmed || wrongIndexes.includes(index)) return
    setSelectedIndex(index)
    if (index !== activeQuestion.correctIndex) {
      setWrongIndexes((current) => (current.includes(index) ? current : [...current, index]))
      playWrong()
      return
    }
    setConfirmed(true)
    setAnsweredIds((current) => {
      if (current.includes(activeQuestion.id)) return current
      const next = [...current, activeQuestion.id]
      answeredRef.current = next
      return next
    })
    setScore((current) => {
      const next = current + 1
      scoreRef.current = next
      return next
    })
    playCorrect()
    window.clearTimeout(returnTimer.current)
    returnTimer.current = window.setTimeout(
      returnToSubjectWheel,
      timings.feedbackSeconds * 1000,
    )
  }

  function returnToSubjectWheel() {
    window.clearTimeout(returnTimer.current)
    const finished = answeredRef.current.length >= TOTAL_QUESTIONS
    setActiveQuestion(null)
    setSelectedIndex(null)
    setWrongIndexes([])
    setConfirmed(false)
    if (finished) {
      const finalScore = scoreRef.current
      clearSubject()
      setPhase('results')
      setShowResults(true)
      if (finalScore >= 15) playFanfare()
      return
    }
    const subject = lockedSubjectRef.current
    const subjectDone = Boolean(subject) && !pickQuestion(subject.id, answeredRef.current)
    clearSubject()
    setNotice(subjectDone && subject ? subject.id : '')
    setPhase('idle')
  }

  function continueGame() {
    if (!confirmed) return
    returnToSubjectWheel()
  }

  function backFromQuestion() {
    if (!activeQuestion || confirmed || spinningRef.current) return
    window.clearTimeout(returnTimer.current)
    pendingQuestion.current = null
    setActiveQuestion(null)
    setSelectedIndex(null)
    setWrongIndexes([])
    setConfirmed(false)
    setPhase('subject')
  }

  function backToSubjects() {
    if (phase !== 'subject' || spinningRef.current || questionSpinningRef.current) return
    clearSubject()
    setNotice('')
    setPhase('idle')
  }

  function resetSession() {
    sessionRef.current += 1
    window.clearTimeout(returnTimer.current)
    stopSpin()
    spinningRef.current = false
    pendingSubjectId.current = null
    pendingQuestion.current = null
    spinKind.current = 'subject'
    questionRotationRef.current = 0
    questionSpinningRef.current = false
    questionSpinStarted.current = 0
    answeredRef.current = []
    clearSubject()
    setQuestionRotation(0)
    setQuestionSpinning(false)
    setAnsweredIds([])
    scoreRef.current = 0
    setScore(0)
    setSpinning(false)
    setActiveQuestion(null)
    setSelectedIndex(null)
    setWrongIndexes([])
    setConfirmed(false)
    setNotice('')
    setShowResults(false)
    setConfirmReset(false)
    setPhase('idle')
  }

  function requestNewGame() {
    setConfirmReset(true)
  }

  function cancelNewGame() {
    setConfirmReset(false)
  }

  function confirmNewGame() {
    resetSession()
  }

  const activeSubject = activeQuestion ? subjectById(activeQuestion.subjectId) : null
  const subjectQuestions = lockedSubject ? questionsForSubject(lockedSubject.id) : []

  return {
    answeredIds,
    score,
    total: TOTAL_QUESTIONS,
    rotation,
    spinDuration,
    questionRotation,
    questionSpinning,
    spinning,
    phase,
    revealSubject,
    lockedSubject,
    subjectQuestions,
    celebrate,
    notice,
    activeQuestion,
    activeSubject,
    selectedIndex,
    wrongIndexes,
    confirmed,
    showResults,
    spin,
    spinQuestion,
    finishSpin,
    finishQuestionSpin,
    selectAnswer,
    continueGame,
    backFromQuestion,
    backToSubjects,
    confirmReset,
    requestNewGame,
    cancelNewGame,
    confirmNewGame,
    playAgain: requestNewGame,
  }
}
