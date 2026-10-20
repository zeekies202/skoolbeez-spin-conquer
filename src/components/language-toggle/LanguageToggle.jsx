import { setLanguage, useCopy } from '../../utils/language'

export default function LanguageToggle() {
  const text = useCopy()

  return (
    <div className="language-toggle" role="group" aria-label={text.languageLabel}>
      <button
        type="button"
        className={text.language === 'ms' ? 'is-active' : ''}
        aria-pressed={text.language === 'ms'}
        onClick={() => setLanguage('ms')}
      >
        BM
      </button>
      <button
        type="button"
        className={text.language === 'en' ? 'is-active' : ''}
        aria-pressed={text.language === 'en'}
        onClick={() => setLanguage('en')}
      >
        EN
      </button>
    </div>
  )
}
