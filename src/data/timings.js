/** Stage durations in seconds. Change these to retune the show. */
export const timings = {
  spinSeconds: 6,
  questionSpinSeconds: 6,
  feedbackSeconds: 3.5,
  spinMin: 8,
  spinMax: 12,
  pauseAfterStop: 1,
  subjectHoldMin: 4,
  subjectHoldMax: 5,
}

export function secondsBetween(min, max) {
  return min + Math.random() * (max - min)
}
