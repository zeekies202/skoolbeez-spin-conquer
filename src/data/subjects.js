export const subjects = [
  {
    id: 'sejarah',
    name: 'Sejarah',
    color: '#e23d2b',
    angle: 144,
  },
  {
    id: 'bahasa-melayu',
    name: 'Bahasa Melayu',
    color: '#f0b400',
    angle: 288,
  },
  {
    id: 'sains',
    name: 'Sains',
    color: '#1fa84a',
    angle: 72,
  },
  {
    id: 'matematik',
    name: 'Matematik',
    color: '#7a3ff0',
    angle: 0,
  },
  {
    id: 'english',
    name: 'English',
    color: '#1d6fe8',
    angle: 216,
  },
]

export function subjectById(subjectId) {
  return subjects.find((subject) => subject.id === subjectId)
}
