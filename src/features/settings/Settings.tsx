import { useState } from 'react'
import {
  Menu,
  Settings as SettingsIcon,
  Trash2,
  AlertTriangle,
  ShieldCheck,
  User as UserIcon,
  Sun,
  Moon,
  Globe,
  Palette,
} from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'
import { useTheme } from '../../context/ThemeContext'
import { useAuth } from '../../context/AuthContext'
import { LanguageSwitcher } from '../../components/ui/LanguageSwitcher'
import { NukeConfirmationDialog } from './components/NukeConfirmationDialog'

interface SettingsProps {
  readonly onOpenSidebar: () => void
  readonly onNavigate: (page: string) => void
}

export function Settings({ onOpenSidebar, onNavigate }: SettingsProps) {
  const { t } = useLanguage()
  const { theme, toggleTheme } = useTheme()
  const { user } = useAuth()
  const [showNukeDialog, setShowNukeDialog] = useState(false)

  const displayName = user?.username ?? t('settings.account.fallbackName')
  const channelName = user?.channel?.name ?? '-'
  const avatarUrl = user?.channel?.profileImageUrl

  // The app currently maps the visual dark UI to the "light" theme token set.
  const isDarkAppearance = theme === 'light'
  const themeActionLabel = isDarkAppearance
    ? t('settings.preferences.themeAction.light')
    : t('settings.preferences.themeAction.dark')

  return (
    <div className="flex flex-col">
      <div className="flex-1 overflow-auto bg-[#0e0e10] dark:bg-gray-50">
        {/* Header */}
        <div className="bg-[#18181b] dark:bg-white border-b border-[#2d2d31] dark:border-gray-200 px-4 sm:px-8 py-6">
          <div className="mx-auto flex max-w-6xl items-center gap-4">
            <button
              onClick={onOpenSidebar}
              className="lg:hidden text-white dark:text-gray-900 flex-shrink-0"
              aria-label="Open sidebar"
            >
              <Menu className="h-6 w-6" />
            </button>

            <div className="flex items-center gap-4 min-w-0">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#9146FF] to-[#772ce8] text-white shadow-lg shadow-[#9146FF]/30">
                <SettingsIcon className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <div className="text-xs uppercase tracking-widest text-gray-400 dark:text-gray-500">
                  Stream Quest
                </div>
                <h1 className="text-2xl sm:text-3xl text-white dark:text-gray-900">
                  {t('settings.title')}
                </h1>
                <p className="text-sm sm:text-base text-gray-400 dark:text-gray-600">
                  {t('settings.subtitle')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-8 py-8 flex flex-col gap-8">
          {/* Account */}
          <section aria-labelledby="account-title">
            <div className="mb-3">
              <h2 id="account-title" className="text-lg sm:text-xl text-white dark:text-gray-900">
                {t('settings.account.title')}
              </h2>
              <p className="mt-1 text-sm text-gray-400 dark:text-gray-600">
                {t('settings.account.sectionDescription')}
              </p>
            </div>

            <div className="rounded-xl border border-[#2d2d31] dark:border-gray-200 bg-[#18181b] dark:bg-white overflow-hidden">
              <div className="flex flex-col gap-5 p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="flex h-16 w-16 sm:h-20 sm:w-20 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-[#9146FF] to-[#772ce8] text-2xl sm:text-3xl text-white ring-2 ring-[#9146FF]/30">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <UserIcon className="h-8 w-8" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="text-xl sm:text-2xl text-white dark:text-gray-900 truncate">
                        {displayName}
                      </p>
                      <p className="text-sm text-gray-400 dark:text-gray-600">
                        {t('settings.account.description')}
                      </p>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-2 rounded-full border border-[#9146FF]/30 bg-[#9146FF]/20 px-3 py-2 text-sm text-[#9146FF]">
                    <ShieldCheck className="h-4 w-4" />
                    {t('settings.account.connectedVia')}
                  </span>
                </div>

                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="rounded-xl border border-[#2d2d31] dark:border-gray-200 bg-[#0e0e10] dark:bg-gray-50 px-4 py-3">
                    <dt className="text-xs uppercase tracking-widest text-gray-500 dark:text-gray-500">
                      {t('settings.account.username')}
                    </dt>
                    <dd className="mt-1 text-base text-white dark:text-gray-900 truncate">
                      {displayName}
                    </dd>
                  </div>
                  <div className="rounded-xl border border-[#2d2d31] dark:border-gray-200 bg-[#0e0e10] dark:bg-gray-50 px-4 py-3">
                    <dt className="text-xs uppercase tracking-widest text-gray-500 dark:text-gray-500">
                      {t('settings.account.channel')}
                    </dt>
                    <dd className="mt-1 text-base text-white dark:text-gray-900 truncate">
                      {channelName}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </section>

          {/* Preferences */}
          <section aria-labelledby="preferences-title">
            <div className="mb-3">
              <h2
                id="preferences-title"
                className="text-lg sm:text-xl text-white dark:text-gray-900"
              >
                {t('settings.preferences.title')}
              </h2>
              <p className="mt-1 text-sm text-gray-400 dark:text-gray-600">
                {t('settings.preferences.description')}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Appearance */}
              <div className="rounded-xl border border-[#2d2d31] dark:border-gray-200 bg-[#18181b] dark:bg-white p-4 sm:p-6">
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#9146FF]/20">
                    <Palette className="h-5 w-5 text-[#9146FF]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white dark:text-gray-900">
                      {t('settings.preferences.appearance')}
                    </p>
                    <p className="mt-1 text-sm text-gray-400 dark:text-gray-500 leading-relaxed">
                      {t('settings.preferences.appearanceDescription')}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={toggleTheme}
                  aria-label={themeActionLabel}
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#9146FF] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#772ce8]"
                >
                  {isDarkAppearance ? (
                    <>
                      <Sun className="h-4 w-4 text-[#ffd700]" />
                      {themeActionLabel}
                    </>
                  ) : (
                    <>
                      <Moon className="h-4 w-4" />
                      {themeActionLabel}
                    </>
                  )}
                </button>
              </div>

              {/* Language */}
              <div className="rounded-xl border border-[#2d2d31] dark:border-gray-200 bg-[#18181b] dark:bg-white p-4 sm:p-6">
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#9146FF]/20">
                    <Globe className="h-5 w-5 text-[#9146FF]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white dark:text-gray-900">
                      {t('settings.preferences.language')}
                    </p>
                    <p className="mt-1 text-sm text-gray-400 dark:text-gray-500 leading-relaxed">
                      {t('settings.preferences.languageDescription')}
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex justify-center rounded-lg border border-[#2d2d31] dark:border-gray-200 bg-[#0e0e10] dark:bg-gray-50 px-3">
                  <LanguageSwitcher className="w-full" />
                </div>
              </div>
            </div>
          </section>

          {/* Data Management */}
          <section aria-labelledby="danger-zone-title">
            <div className="mb-3">
              <h2
                id="danger-zone-title"
                className="text-lg sm:text-xl text-white dark:text-gray-900"
              >
                {t('settings.dangerZone.title')}
              </h2>
              <p className="mt-1 text-sm text-gray-400 dark:text-gray-600">
                {t('settings.dangerZone.description')}
              </p>
            </div>

            <div className="relative rounded-xl border border-[#2d2d31] dark:border-gray-200 bg-[#18181b] dark:bg-white overflow-hidden">
              <div className="relative flex flex-col sm:flex-row sm:items-center gap-5 p-4 sm:p-6">
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#ff4444]/20">
                    <AlertTriangle className="h-5 w-5 text-[#ff4444]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white dark:text-gray-900">
                      {t('settings.nuke.title')}
                    </p>
                    <p className="mt-1 text-sm text-gray-400 dark:text-gray-500 leading-relaxed">
                      {t('settings.nuke.buttonDescription')}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowNukeDialog(true)}
                  className="flex-shrink-0 inline-flex items-center justify-center gap-2 self-start sm:self-center rounded-lg bg-[#ff4444]/20 px-5 py-3 text-sm font-semibold text-[#ff4444] transition-colors hover:bg-[#ff4444]/30"
                >
                  <Trash2 className="h-4 w-4" />
                  {t('settings.nuke.action')}
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
