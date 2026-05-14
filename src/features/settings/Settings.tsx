import { useState } from 'react'
import {
  Menu,
  Settings as SettingsIcon,
  Trash2,
  AlertTriangle,
  Sun,
  Moon,
  Globe,
  Palette,
} from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'
import { useTheme } from '../../context/ThemeContext'
import { LanguageSwitcher } from '../../components/ui/LanguageSwitcher'
import { NukeConfirmationDialog } from './components/NukeConfirmationDialog'

interface SettingsProps {
  readonly onOpenSidebar: () => void
  readonly onNavigate: (page: string) => void
}

export function Settings({ onOpenSidebar, onNavigate }: SettingsProps) {
  const { t } = useLanguage()
  const { theme, toggleTheme } = useTheme()
  const [showNukeDialog, setShowNukeDialog] = useState(false)

  const isLightVisual = theme === 'dark'

  return (
    <div className="flex flex-col">
      <div className="flex-1 overflow-auto bg-[#0e0e10] dark:bg-gray-50">
        {/* Header */}
        <div className="relative overflow-hidden border-b border-[#2d2d31] bg-[#18181b] dark:border-gray-200 dark:bg-white">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#9146FF]/20 via-transparent to-transparent"
          />
          <div className="relative mx-auto flex max-w-4xl items-center gap-4 px-4 py-6 sm:px-8">
            <button
              onClick={onOpenSidebar}
              className="lg:hidden text-white dark:text-gray-900 flex-shrink-0"
              aria-label="Open sidebar"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#9146FF] to-[#772ce8] text-white shadow-lg shadow-purple-900/30">
                <SettingsIcon className="h-6 w-6" />
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.22em] text-gray-400 dark:text-gray-500">
                  Stream Quest
                </div>
                <h1 className="mt-0.5 text-2xl text-white dark:text-gray-900 sm:text-3xl">
                  {t('settings.title')}
                </h1>
                <p className="mt-1 text-sm text-gray-400 dark:text-gray-600">
                  {t('settings.subtitle')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-10 px-4 py-10 sm:px-8">
          {/* Preferences */}
          <section aria-labelledby="preferences-title">
            <div className="mb-4 flex items-center gap-3">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#2d2d31] to-transparent dark:via-gray-300" />
              <h2
                id="preferences-title"
                className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-300 dark:text-gray-600"
              >
                {t('settings.preferences.title')}
              </h2>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#2d2d31] to-transparent dark:via-gray-300" />
            </div>

            <div className="overflow-hidden rounded-2xl border border-[#2d2d31] bg-[#1f1f23] shadow-xl shadow-black/20 dark:border-gray-200 dark:bg-white dark:shadow-gray-200/40">
              {/* Appearance */}
              <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-7">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#9146FF]/20 to-[#9146FF]/5 ring-1 ring-[#9146FF]/30">
                    <Palette className="h-6 w-6 text-[#c9a4ff] dark:text-[#7c3aed]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-base font-semibold text-white dark:text-gray-900">
                      {t('settings.preferences.appearance')}
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-gray-400 dark:text-gray-600">
                      {t('settings.preferences.appearanceDescription')}
                    </p>
                  </div>
                </div>

                <div
                  role="radiogroup"
                  aria-label={t('settings.preferences.appearance')}
                  className="flex w-full flex-shrink-0 items-center gap-1 rounded-xl border border-[#2d2d31] bg-[#0e0e10] p-1 dark:border-gray-200 dark:bg-gray-100 sm:w-auto"
                >
                  <button
                    type="button"
                    role="radio"
                    aria-checked={!isLightVisual}
                    onClick={() => {
                      if (isLightVisual) toggleTheme()
                    }}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all sm:flex-initial ${
                      !isLightVisual
                        ? 'bg-gradient-to-br from-[#9146FF] to-[#772ce8] text-white shadow-md shadow-[#9146FF]/30'
                        : 'text-gray-400 hover:text-white dark:text-gray-600 dark:hover:text-gray-900'
                    }`}
                  >
                    <Moon className="h-4 w-4" />
                    {t('common.darkMode')}
                  </button>
                  <button
                    type="button"
                    role="radio"
                    aria-checked={isLightVisual}
                    onClick={() => {
                      if (!isLightVisual) toggleTheme()
                    }}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all sm:flex-initial ${
                      isLightVisual
                        ? 'bg-gradient-to-br from-[#9146FF] to-[#772ce8] text-white shadow-md shadow-[#9146FF]/30'
                        : 'text-gray-400 hover:text-white dark:text-gray-600 dark:hover:text-gray-900'
                    }`}
                  >
                    <Sun className="h-4 w-4" />
                    {t('common.lightMode')}
                  </button>
                </div>
              </div>

              <div className="border-t border-[#2d2d31] dark:border-gray-200" />

              {/* Language */}
              <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-7">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#9146FF]/20 to-[#9146FF]/5 ring-1 ring-[#9146FF]/30">
                    <Globe className="h-6 w-6 text-[#c9a4ff] dark:text-[#7c3aed]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-base font-semibold text-white dark:text-gray-900">
                      {t('settings.preferences.language')}
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-gray-400 dark:text-gray-600">
                      {t('settings.preferences.languageDescription')}
                    </p>
                  </div>
                </div>

                <div className="flex flex-shrink-0 items-center justify-center rounded-xl border border-[#2d2d31] bg-[#0e0e10] px-4 dark:border-gray-200 dark:bg-gray-100">
                  <LanguageSwitcher />
                </div>
              </div>
            </div>
          </section>

          {/* Danger Zone */}
          <section aria-labelledby="danger-zone-title">
            <div className="mb-4 flex items-center gap-3">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-red-500/40 to-transparent" />
              <h2
                id="danger-zone-title"
                className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-red-400 dark:text-red-600"
              >
                <AlertTriangle className="h-3.5 w-3.5" />
                {t('settings.dangerZone.title')}
              </h2>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-red-500/40 to-transparent" />
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-red-500/40 bg-[#1f1f23] shadow-xl shadow-red-950/30 dark:bg-white dark:shadow-red-200/40">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-gradient-to-br from-red-500/15 via-transparent to-transparent"
              />
              <div className="relative flex flex-col gap-6 p-6 sm:p-7">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-red-500/20 ring-1 ring-red-500/40">
                    <AlertTriangle className="h-6 w-6 text-red-400 dark:text-red-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-base font-semibold text-white dark:text-gray-900">
                      {t('settings.nuke.button')}
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-gray-300 dark:text-gray-600">
                      {t('settings.nuke.buttonDescription')}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowNukeDialog(true)}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-red-600 to-red-700 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-red-900/40 transition-all hover:from-red-500 hover:to-red-600 hover:shadow-xl hover:shadow-red-900/50 active:scale-[0.98] sm:w-auto sm:self-end"
                >
                  <Trash2 className="h-5 w-5" />
                  {t('settings.nuke.button')}
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>

      {showNukeDialog && (
        <NukeConfirmationDialog
          onClose={() => setShowNukeDialog(false)}
          onNuked={() => onNavigate('landing')}
        />
      )}
    </div>
  )
}
