import { useSyncExternalStore } from 'react'

const subjectNames = {
  sejarah: { ms: 'Sejarah', en: 'History' },
  'bahasa-melayu': { ms: 'Bahasa Melayu', en: 'Bahasa Melayu' },
  sains: { ms: 'Sains', en: 'Science' },
  matematik: { ms: 'Matematik', en: 'Mathematics' },
  english: { ms: 'English', en: 'English' },
}

const copy = {
  ms: {
    spin: 'PUTAR',
    spinning: 'BERPUTAR',
    back: 'Kembali',
    reset: 'Set semula',
    cancel: 'Batal',
    confirm: 'Sahkan',
    continue: 'Teruskan',
    seeResults: 'Lihat keputusan',
    playAgain: 'MAIN LAGI',
    correct: 'Betul!',
    wrong: (answer) => `Belum tepat. Jawapan yang betul ialah ${answer}.`,
    cheerWin: 'YEAYYY! BETUL!',
    cheerMiss: 'AWWW!',
    resultsTitle: 'Anda menakluki roda!',
    outOf: 'daripada',
    resultsPerfect: 'Markah penuh. Buzzy sangat bangga!',
    resultsHigh: 'Kerja yang cemerlang. Takhta ilmu milik anda!',
    resultsMid: 'Usaha yang baik. Anda menakluki lebih separuh soalan!',
    resultsLow: 'Teruskan belajar dan main semula untuk mengatasi markah ini!',
    resetTitle: 'Set semula',
    resetBody: 'Mulakan sesi murid baharu? Skor, progress dan soalan yang sudah dijawab akan dikosongkan.',
    subjectDone: (name) => `Semua soalan ${name} sudah dijawab. Sila spin subjek lain.`,
    answerOptions: 'Pilihan jawapan',
    mute: 'Senyapkan bunyi',
    unmute: 'Hidupkan bunyi',
    languageLabel: 'Bahasa',
  },
  en: {
    spin: 'SPIN NOW',
    spinning: 'SPINNING',
    back: 'Back',
    reset: 'Reset',
    cancel: 'Cancel',
    confirm: 'Confirm',
    continue: 'Continue',
    seeResults: 'See results',
    playAgain: 'PLAY AGAIN',
    correct: 'Correct!',
    wrong: (answer) => `Not quite. The correct answer is ${answer}.`,
    cheerWin: 'YEAYYY! CORRECT!',
    cheerMiss: 'AWWW!',
    resultsTitle: 'You conquered the wheel!',
    outOf: 'out of',
    resultsPerfect: 'Perfect score. Buzzy is buzzing with pride!',
    resultsHigh: 'Excellent work. The kingdom of knowledge is yours!',
    resultsMid: 'Good effort. You conquered more than half the questions!',
    resultsLow: 'Keep learning and play again to beat this score!',
    resetTitle: 'Reset',
    resetBody: 'Start a new student session? Score, progress and answered questions will be cleared.',
    subjectDone: (name) => `All ${name} questions have been answered. Please spin another subject.`,
    answerOptions: 'Answer options',
    mute: 'Mute sound',
    unmute: 'Unmute sound',
    languageLabel: 'Language',
  },
}

let language = 'ms'
const listeners = new Set()

function emit() {
  listeners.forEach((listener) => listener())
}

export function getLanguage() {
  return language
}

export function subscribeLanguage(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function setLanguage(next) {
  if (next !== 'ms' && next !== 'en') return
  if (next === language) return
  language = next
  emit()
}

export function subjectLabel(subjectId, current = language) {
  const names = subjectNames[subjectId]
  if (!names) return current === 'ms' ? 'ini' : 'this'
  return names[current]
}

export function useCopy() {
  const current = useSyncExternalStore(subscribeLanguage, getLanguage)
  return {
    language: current,
    ...copy[current],
    subjectName: (subjectId) => subjectLabel(subjectId, current),
  }
}
