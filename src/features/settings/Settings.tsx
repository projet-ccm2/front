import { useState } from 'react'
import { Menu, Settings as SettingsIcon, Trash2, AlertTriangle } from 'lucide-react'
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
    <div className="flex flex-col">
      <div className="flex-1 overflow-auto bg-[#0e0e10] dark:bg-gray-50">
        {/* Header */}
        <div className="bg-[#18181b] dark:bg-white border-b border-[#2d2d31] dark:border-gray-200 px-4 sm:px-8 py-6">
          <div className="mx-auto max-w-4xl flex items-center gap-4">
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
          {/* Danger Zone */}
          <section aria-labelledby="danger-zone-title">
            <h2
              id="danger-zone-title"
              className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500"
            >
              {t('settings.dangerZone.title')}
            </h2>

            <div className="rounded-2xl border border-red-500/25 bg-[#18181b] dark:bg-white overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center gap-5 p-6">
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-red-500/15">
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
