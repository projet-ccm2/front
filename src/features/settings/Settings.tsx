import { useState } from 'react'
import { Menu, AlertTriangle } from 'lucide-react'
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
    <div className="min-h-screen bg-[#0e0e10] dark:bg-white">
      {/* Mobile header */}
      <div className="lg:hidden flex items-center gap-3 p-4 border-b border-[#2d2d31] dark:border-gray-200">
        <button
          onClick={onOpenSidebar}
          className="text-gray-400 hover:text-white dark:text-gray-600 dark:hover:text-gray-900"
          aria-label="Open sidebar"
        >
          <Menu className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-semibold text-white dark:text-gray-900">
          {t('settings.title')}
        </h1>
      </div>

      <div className="p-6 max-w-2xl mx-auto space-y-8">
        {/* Page title (desktop) */}
        <div className="hidden lg:block">
          <h1 className="text-2xl font-bold text-white dark:text-gray-900">
            {t('settings.title')}
          </h1>
        </div>

        {/* Danger Zone */}
        <section
          className="border border-red-500/40 rounded-xl p-6 space-y-4"
          aria-labelledby="danger-zone-title"
        >
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <div>
              <h2 id="danger-zone-title" className="font-semibold text-red-400 dark:text-red-600">
                {t('settings.dangerZone.title')}
              </h2>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">
                {t('settings.dangerZone.description')}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 pt-2 border-t border-[#2d2d31] dark:border-gray-200">
            <div>
              <p className="text-sm font-medium text-white dark:text-gray-900">
                {t('settings.nuke.button')}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                {t('settings.nuke.buttonDescription')}
              </p>
            </div>
            <button
              onClick={() => setShowNukeDialog(true)}
              className="flex-shrink-0 px-4 py-2 text-sm rounded-lg border border-red-500/60 text-red-400 hover:bg-red-500/10 dark:text-red-600 dark:border-red-500/40 dark:hover:bg-red-50 transition-colors"
            >
              {t('settings.nuke.button')}
            </button>
          </div>
        </section>
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
