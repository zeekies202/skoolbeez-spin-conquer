import { assets } from './data/assets'
import Buzzy from './components/buzzy/Buzzy'
import Layout from './components/layout/Layout'
import LanguageToggle from './components/language-toggle/LanguageToggle'
import Navbar from './components/navbar/Navbar'
import NewGameDialog from './components/new-game/NewGameDialog'
import QuizModal from './components/quiz-modal/QuizModal'
import SoundToggle from './components/sound-toggle/SoundToggle'
import SpinWheel from './components/spin-wheel/SpinWheel'
import { useGame } from './hooks/useGame'
import { useCopy } from './utils/language'

function HoneyPortal() {
  return (
    <div className="honey-portal" aria-hidden="true">
      <span className="honey-glow" />
      <span className="honey-ring" />
      <span className="honey-ring is-mid" />
      <span className="honey-ring is-inner" />
      <span className="honey-drop" />
      <span className="honey-drop" />
      <span className="honey-drop" />
      <span className="honey-drop" />
      <span className="honey-drop" />
    </div>
  )
}

export default function App() {
  const game = useGame()
  const text = useCopy()
  const questionReady = Boolean(game.lockedSubject)
  const buttonLabel = game.spinning ? text.spinning : text.spin

  return (
    <Layout>
      <Navbar />
      <img
        className="wheel-logo"
        src={assets.spinLogo}
        alt=""
        draggable="false"
      />
      <SoundToggle />
      <LanguageToggle />
      <button type="button" className="back-button reset-button" onClick={game.requestNewGame}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M20 12a8 8 0 1 1-2.2-5.5" />
          <path d="M20 4.2V9h-4.8" />
        </svg>
        {text.reset}
      </button>
      {game.spinning ? (
        <div className="stage-spots" aria-hidden="true">
          <span />
          <span />
        </div>
      ) : null}
      {game.phase === 'portal' ? <HoneyPortal /> : null}
      {game.phase === 'question' || game.showResults ? null : (
        <Buzzy mood={game.phase === 'portal' ? 'fly' : game.spinning ? 'spin' : 'idle'} />
      )}
      {game.phase === 'subject' ? (
        <button type="button" className="back-button stage-back" onClick={game.backToSubjects}>
          <span aria-hidden="true">←</span>
          {text.back}
        </button>
      ) : null}
      <main className="playfield">
        <SpinWheel
          rotation={game.rotation}
          spinDuration={game.spinDuration}
          spinning={game.spinning}
          answeredIds={game.answeredIds}
          disabled={game.spinning || game.phase === 'portal' || game.phase === 'question' || game.showResults}
          onSpin={questionReady ? game.spinQuestion : game.spin}
          onSpinEnd={game.finishSpin}
          buttonLabel={buttonLabel}
          subject={game.lockedSubject}
          questions={game.subjectQuestions}
          questionRotation={game.questionRotation}
          questionSpinning={game.questionSpinning}
          onQuestionSpinEnd={game.finishQuestionSpin}
        />
      </main>
      {game.notice ? (
        <p className="spin-notice" role="status">
          {text.subjectDone(text.subjectName(game.notice))}
        </p>
      ) : null}
      <QuizModal
        question={game.activeQuestion}
        subject={game.activeSubject}
        selectedIndex={game.selectedIndex}
        wrongIndexes={game.wrongIndexes}
        confirmed={game.confirmed}
        answeredCount={game.answeredIds.length}
        total={game.total}
        showResults={game.showResults}
        score={game.score}
        onSelect={game.selectAnswer}
        onContinue={game.continueGame}
        onBack={game.backFromQuestion}
        onPlayAgain={game.requestNewGame}
      />
      <NewGameDialog
        open={game.confirmReset}
        onCancel={game.cancelNewGame}
        onConfirm={game.confirmNewGame}
      />
    </Layout>
  )
}
