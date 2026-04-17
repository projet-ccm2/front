import { useLanguage } from '../../context/LanguageContext'

interface LanguageSwitcherProps {
  className?: string
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
      className={`flex items-center justify-center gap-2.5 rounded-lg border border-[#2d2d31] bg-[#18181b] px-3 py-2 transition-colors hover:bg-[#2d2d31] dark:border-gray-200 dark:bg-white dark:hover:bg-gray-100 ${className}`}
    >
      <span
        className={`text-sm font-semibold transition-colors duration-200 ${
          !isFr ? 'text-white dark:text-gray-900' : 'text-gray-500 dark:text-gray-400'
        }`}
      >
        EN
      </span>

      <div className="relative h-5 w-9 rounded-full bg-[#9146FF] shadow-[0_0_8px_rgba(145,70,255,0.4)]">
        <div
          className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ease-in-out ${
            isFr ? 'translate-x-4' : 'translate-x-0'
          }`}
        />
      </div>

      <span
        className={`text-sm font-semibold transition-colors duration-200 ${
          isFr ? 'text-white dark:text-gray-900' : 'text-gray-500 dark:text-gray-400'
        }`}
      >
        FR
      </span>
    </button>
  )
}
