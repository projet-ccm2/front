import { useState } from 'react'
import { Menu, Settings as SettingsIcon, Trash2 } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'
import { NukeConfirmationDialog } from './components/NukeConfirmationDialog'

interface SettingsProps {
  readonly onOpenSidebar: () => void
  readonly onNavigate: (page: string) => void
}

export function Settings({ onOpenSidebar, onNavigate }: SettingsProps) {
  const { t } = useLanguage()
  const [showNukeDialog, setShowNukeDialog] = useState(false)

  return (
    <div className="flex min-h-screen flex-col bg-[#0e0e10] text-[#efeff1] dark:bg-gray-50 dark:text-gray-900">
      {/* Header */}
      <div className="border-b border-[#2d2d31] bg-[#18181b] px-4 py-6 dark:border-gray-200 dark:bg-white sm:px-8">
        <div className="mx-auto flex max-w-6xl items-center gap-4">
          <button
            onClick={onOpenSidebar}
            className="lg:hidden text-[#efeff1] dark:text-gray-900"
            aria-label="Open sidebar"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#9146FF] to-[#772ce8] text-white">
              <SettingsIcon className="h-6 w-6" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.22em] text-gray-400 dark:text-gray-600">
                Stream Quest
              </div>
              <h1 className="mt-1 text-2xl text-[#efeff1] dark:text-gray-900">
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
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-8">
        <div
          className="rounded-3xl border border-red-500/30 bg-[#18181b] p-5 sm:p-6 dark:border-red-500/30 dark:bg-white"
          aria-labelledby="danger-zone-title"
        >
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-500/15">
              <Trash2 className="h-5 w-5 text-red-400" />
            </div>
            <div>
              <h2
                id="danger-zone-title"
                className="font-semibold text-red-400 dark:text-red-600"
              >
                {t('settings.dangerZone.title')}
              </h2>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                {t('settings.dangerZone.description')}
              </p>
            </div>
          </div>

          <div className="border-t border-[#2d2d31] dark:border-gray-200 pt-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-[#efeff1] dark:text-gray-900">
                {t('settings.nuke.button')}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                {t('settings.nuke.buttonDescription')}
              </p>
            </div>
            <button
              onClick={() => setShowNukeDialog(true)}
              className="flex-shrink-0 inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
            >
              <Trash2 className="h-4 w-4" />
              {t('settings.nuke.button')}
            </button>
          </div>
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
