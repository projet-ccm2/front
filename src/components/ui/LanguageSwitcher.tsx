import { useLanguage } from '../../context/LanguageContext'

export function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage()

  return (
    <div className="relative inline-flex items-center rounded-xl border border-[#2d2d31] bg-[#18181b] p-1 dark:border-gray-200 dark:bg-white">
      <div
        className={`pointer-events-none absolute inset-y-1 left-1 w-20 rounded-lg bg-[#9146FF] shadow-[0_0_12px_rgba(145,70,255,0.35)] transition-transform duration-200 ease-in-out ${
          language === 'fr' ? 'translate-x-full' : 'translate-x-0'
        }`}
      />

      {(
        [
          {
            languageCode: 'en',
            flag: '🇺🇸',
            shortLabel: t('language.shortEnglish'),
            ariaLabel: t('language.switchToEnglish'),
          },
          {
            languageCode: 'fr',
            flag: '🇫🇷',
            shortLabel: t('language.shortFrench'),
            ariaLabel: t('language.switchToFrench'),
          },
        ] as const
      ).map(option => {
        const isSelected = language === option.languageCode

        return (
          <button
            key={option.languageCode}
            type="button"
            onClick={() => setLanguage(option.languageCode)}
            aria-label={option.ariaLabel}
            aria-pressed={isSelected}
            title={option.ariaLabel}
            className={`relative z-10 flex w-20 items-center justify-center gap-1.5 py-1.5 text-sm font-semibold transition-colors duration-200 ${
              isSelected
                ? 'text-white'
                : 'text-gray-400 hover:text-white dark:text-gray-500 dark:hover:text-gray-900'
            }`}
          >
            <span aria-hidden="true">{option.flag}</span>
            <span aria-hidden="true">{option.shortLabel}</span>
          </button>
        )
      })}
    </div>
  )
}
