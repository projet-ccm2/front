import { useLanguage } from '../../context/LanguageContext'

export function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage()

  return (
    <div className="flex items-center gap-2 rounded-lg border border-[#2d2d31] bg-[#18181b] p-1 dark:border-gray-200 dark:bg-white">
      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
          language === 'en'
            ? 'bg-[#9146FF] text-white'
            : 'text-gray-400 hover:text-white dark:text-gray-600 dark:hover:text-gray-900'
        }`}
        aria-pressed={language === 'en'}
      >
        {t('language.english')}
      </button>
      <button
        type="button"
        onClick={() => setLanguage('fr')}
        className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
          language === 'fr'
            ? 'bg-[#9146FF] text-white'
            : 'text-gray-400 hover:text-white dark:text-gray-600 dark:hover:text-gray-900'
        }`}
        aria-pressed={language === 'fr'}
      >
        {t('language.french')}
      </button>
    </div>
  )
}
