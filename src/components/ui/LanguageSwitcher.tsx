import { Check, Languages } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'

export function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage()

  return (
    <div className="inline-flex items-center gap-2 rounded-2xl border border-[#2d2d31] bg-[#18181b] p-1.5 shadow-sm dark:border-gray-200 dark:bg-white">
      <div className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-gray-300 dark:text-gray-600">
        <Languages className="h-4 w-4 text-[#9146FF]" />
        <span>{t('language.label')}</span>
      </div>

      <div className="flex items-center gap-1">
        {(
          [
            {
              languageCode: 'en',
              shortLabel: t('language.shortEnglish'),
              ariaLabel: t('language.switchToEnglish'),
            },
            {
              languageCode: 'fr',
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
              className={`relative flex h-10 w-10 items-center justify-center rounded-xl text-sm font-semibold transition-all ${
                isSelected
                  ? 'bg-[#9146FF] text-white shadow-[0_0_0_1px_rgba(145,70,255,0.45),0_8px_24px_rgba(145,70,255,0.25)]'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white dark:text-gray-600 dark:hover:bg-gray-100 dark:hover:text-gray-900'
              }`}
            >
              <span aria-hidden="true">{option.shortLabel}</span>
              {isSelected && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#0e0e10] text-[#00f593] shadow-sm dark:bg-white">
                  <Check className="h-3 w-3" />
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
