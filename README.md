# SkoolBeez Spin & Conquer — EduHub

Standalone interactive quiz game for five school subjects: Sejarah, Bahasa Melayu, Sains, English, and Matematik. Spin the wheel, answer 20 multiple-choice questions, and track your score.

## Requirements

- Node.js 20 or newer
- npm

## Install dependencies

From this project folder:

```bash
npm install
```

## Run locally

```bash
npm run dev
```

Vite prints a local address, usually `http://localhost:5173`. Open that address in a browser.

## Other scripts

```bash
npm run build
npm run preview
npm run lint
```

`npm run build` creates a production bundle in `dist`. `npm run preview` serves that bundle locally.

## Project layout

- `public/images/` — backgrounds, mascot, characters, wheel, subjects, UI, and decorations
- `public/audio/` — sound files
- `public/icons/` — icon files
- `src/components/` — layout, navbar, spin wheel, question panel, quiz modal, and progress
- `src/data/` — subjects and multiple-choice questions
- `src/hooks/` — custom hooks
- `src/utils/` — shared helpers
- `src/styles/` — global styles, design tokens, and animations
