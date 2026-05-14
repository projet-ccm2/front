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

  const isDark = theme === 'dark'
  const displayName = user?.username ?? t('settings.account.fallbackName')
  const channelName = user?.channel?.name ?? '—'
  const avatarUrl = user?.channel?.profileImageUrl

  return (
    <div className="flex flex-col">
      <div className="flex-1 overflow-auto bg-[#0e0e10] dark:bg-gray-50">
        {/* Header */}
        <div className="relative overflow-hidden bg-[#18181b] dark:bg-white border-b border-[#2d2d31] dark:border-gray-200">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#9146FF]/15 via-transparent to-transparent"
          />
          <div className="relative mx-auto max-w-4xl px-4 sm:px-8 py-6 flex items-center gap-4">
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
                <h1 className="mt-0.5 text-2xl sm:text-3xl text-white dark:text-gray-900">
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
        <div className="mx-auto w-full max-w-4xl px-4 sm:px-8 py-8 flex flex-col gap-8">
          {/* Account */}
          <section aria-labelledby="account-title">
            <div className="mb-3 flex items-center justify-between">
              <h2
                id="account-title"
                className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500"
              >
                {t('settings.account.title')}
              </h2>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#9146FF]/30 bg-[#9146FF]/10 px-2.5 py-1 text-[11px] font-medium text-[#c9a4ff] dark:text-[#7c3aed]">
                <ShieldCheck className="h-3 w-3" />
                {t('settings.account.connectedVia')}
              </span>
            </div>

            <div className="rounded-2xl border border-[#2d2d31] dark:border-gray-200 bg-[#18181b] dark:bg-white overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center gap-5 p-6">
                <div className="flex h-16 w-16 sm:h-20 sm:w-20 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-[#9146FF] to-[#772ce8] text-2xl sm:text-3xl text-white ring-2 ring-[#9146FF]/30">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <UserIcon className="h-8 w-8" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-lg sm:text-xl font-semibold text-white dark:text-gray-900 truncate">
                    {displayName}
                  </p>
                  <p className="mt-1 text-sm text-gray-400 dark:text-gray-600">
                    {t('settings.account.description')}
                  </p>

                  <dl className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="rounded-xl border border-[#2d2d31] dark:border-gray-200 bg-[#0f0f12] dark:bg-gray-50 px-4 py-3">
                      <dt className="text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-500">
                        {t('settings.account.username')}
                      </dt>
                      <dd className="mt-1 text-sm font-medium text-white dark:text-gray-900 truncate">
                        {displayName}
                      </dd>
                    </div>
                    <div className="rounded-xl border border-[#2d2d31] dark:border-gray-200 bg-[#0f0f12] dark:bg-gray-50 px-4 py-3">
                      <dt className="text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-500">
                        {t('settings.account.channel')}
                      </dt>
                      <dd className="mt-1 text-sm font-medium text-white dark:text-gray-900 truncate">
                        {channelName}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          </section>

          {/* Preferences */}
          <section aria-labelledby="preferences-title">
            <h2
              id="preferences-title"
              className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500"
            >
              {t('settings.preferences.title')}
            </h2>

            <div className="rounded-2xl border border-[#2d2d31] dark:border-gray-200 bg-[#18181b] dark:bg-white overflow-hidden divide-y divide-[#2d2d31] dark:divide-gray-200">
              {/* Appearance */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-6">
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#9146FF]/15">
                    <Palette className="h-5 w-5 text-[#c9a4ff] dark:text-[#7c3aed]" />
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
                  aria-label={isDark ? t('common.lightMode') : t('common.darkMode')}
                  className="flex-shrink-0 inline-flex items-center gap-2 self-start sm:self-center rounded-xl border border-[#2d2d31] dark:border-gray-300 bg-[#0f0f12] dark:bg-gray-50 px-4 py-2.5 text-sm font-medium text-gray-200 dark:text-gray-700 transition-colors hover:bg-[#2d2d31] dark:hover:bg-gray-100"
                >
                  {isDark ? (
                    <>
                      <Sun className="h-4 w-4 text-[#ffd700]" />
                      {t('common.lightMode')}
                    </>
                  ) : (
                    <>
                      <Moon className="h-4 w-4 text-[#9146FF]" />
                      {t('common.darkMode')}
                    </>
                  )}
                </button>
              </div>

              {/* Language */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-6">
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#9146FF]/15">
                    <Globe className="h-5 w-5 text-[#c9a4ff] dark:text-[#7c3aed]" />
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

                <div className="flex-shrink-0 self-start sm:self-center rounded-xl border border-[#2d2d31] dark:border-gray-300 bg-[#0f0f12] dark:bg-gray-50 px-3">
                  <LanguageSwitcher />
                </div>
              </div>
            </div>
          </section>

          {/* Danger Zone */}
          <section aria-labelledby="danger-zone-title">
            <h2
              id="danger-zone-title"
              className="mb-3 text-xs font-semibold uppercase tracking-widest text-red-400 dark:text-red-600"
            >
              {t('settings.dangerZone.title')}
            </h2>

            <div className="relative rounded-2xl border border-red-500/30 bg-[#18181b] dark:bg-white overflow-hidden">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-gradient-to-br from-red-500/10 via-transparent to-transparent"
              />
              <div className="relative flex flex-col sm:flex-row sm:items-center gap-5 p-6">
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-red-500/15 ring-1 ring-red-500/30">
                    <AlertTriangle className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white dark:text-gray-900">
                      {t('settings.nuke.button')}
                    </p>
                    <p className="mt-1 text-sm text-gray-400 dark:text-gray-500 leading-relaxed">
                      {t('settings.nuke.buttonDescription')}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowNukeDialog(true)}
                  className="flex-shrink-0 inline-flex items-center justify-center gap-2 self-start sm:self-center rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-red-900/40 transition-all hover:bg-red-500 hover:shadow-lg hover:shadow-red-900/40 active:scale-95"
                >
                  <Trash2 className="h-4 w-4" />
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
