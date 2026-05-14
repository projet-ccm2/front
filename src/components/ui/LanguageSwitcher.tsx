import { useLanguage } from '../../context/LanguageContext'

interface LanguageSwitcherProps {
  readonly className?: string
}

export function LanguageSwitcher({ className = '' }: LanguageSwitcherProps) {
  const { language, toggleLanguage, t } = useLanguage()
  const isFr = language === 'fr'

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      role="switch"
      aria-checked={isFr}
      aria-label={isFr ? t('language.switchToEnglish') : t('language.switchToFrench')}
      title={isFr ? t('language.switchToEnglish') : t('language.switchToFrench')}
      className={`flex items-center justify-center gap-3 py-2 ${className}`}
    >
      <span
        className={`text-sm font-semibold transition-colors duration-200 ${
          isFr ? 'text-white dark:text-gray-900' : 'text-gray-500 dark:text-gray-400'
        }`}
      >
        FR
      </span>

      <div className="relative h-6 w-12 rounded-full bg-[#9146FF] shadow-[0_0_8px_rgba(145,70,255,0.4)]">
        <div
          className={`absolute left-1 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-white shadow-md transition-transform duration-200 ease-in-out ${
            isFr ? 'translate-x-0' : 'translate-x-6'
          }`}
        />
      </div>

      <span
        className={`text-sm font-semibold transition-colors duration-200 ${
          isFr ? 'text-gray-500 dark:text-gray-400' : 'text-white dark:text-gray-900'
        }`}
      >
        EN
      </span>
    </button>
  )
}
