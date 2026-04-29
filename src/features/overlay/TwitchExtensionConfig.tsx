import { ClipboardCheck, Code2, ExternalLink, Puzzle, Settings } from 'lucide-react'
import type { ReactNode } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import { buildTwitchExtensionPanelUrl } from './utils/twitchExtensionLink'
import { FRONT_URL } from '../../config/environment'

export function TwitchExtensionConfig() {
  const { t } = useLanguage()
  const extensionUrl =
    typeof window === 'undefined' ? '' : buildTwitchExtensionPanelUrl(FRONT_URL)

  return (
    <div className="min-h-screen bg-[#0e0e10] text-[#efeff1] dark:bg-gray-50 dark:text-gray-900">
      <div className="border-b border-[#2d2d31] bg-[#18181b] px-4 py-6 dark:border-gray-200 dark:bg-white sm:px-8">
        <div className="mx-auto flex max-w-5xl items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#9146FF] to-[#772ce8] text-white">
            <Puzzle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-gray-400 dark:text-gray-600">
              {t('overlay.extension.title')}
            </p>
            <h1 className="mt-1 text-2xl text-white dark:text-gray-900">
              {t('overlay.extension.title')}
            </h1>
            <p className="mt-1 text-sm text-gray-400 dark:text-gray-600">
              {t('overlay.extension.subtitle')}
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-6 sm:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          <ConfigCard
            icon={<ClipboardCheck className="h-5 w-5 text-[#9146FF]" />}
            title={t('overlay.extension.config.baseTitle')}
            description={t('overlay.extension.config.baseDescription')}
            value={`${window.location.origin}/`}
          />
          <ConfigCard
            icon={<Code2 className="h-5 w-5 text-[#9146FF]" />}
            title={t('overlay.extension.config.panelTitle')}
            description={t('overlay.extension.config.panelDescription')}
            value="panel.html"
          />
          <ConfigCard
            icon={<Settings className="h-5 w-5 text-[#9146FF]" />}
            title={t('overlay.extension.config.configTitle')}
            description={t('overlay.extension.config.configDescription')}
            value="config.html"
          />
        </div>

        <div className="rounded-3xl border border-[#2d2d31] bg-[#18181b] p-5 sm:p-6 dark:border-gray-200 dark:bg-white">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-xl text-white dark:text-gray-900">
                {t('overlay.extension.config.title')}
              </h2>
              <p className="mt-1 text-sm text-gray-400 dark:text-gray-600">
                {t('overlay.extension.config.description')}
              </p>
            </div>
            <a
              href={extensionUrl}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#9146FF] px-4 py-2 text-sm text-white transition-colors hover:bg-[#772ce8]"
            >
              <ExternalLink className="h-4 w-4" />
              {t('overlay.extension.copy')}
            </a>
          </div>

          <div className="mt-5 rounded-2xl border border-[#2d2d31] bg-[#0f0f12] p-4 text-sm text-gray-300 dark:border-gray-200 dark:bg-gray-50 dark:text-gray-700">
            <p>{t('overlay.extension.config.note')}</p>
            <p className="mt-3 break-all text-[#efeff1] dark:text-gray-900">{extensionUrl}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function ConfigCard({
  icon,
  title,
  description,
  value,
}: Readonly<{
  icon: ReactNode
  title: string
  description: string
  value: string
}>) {
  return (
    <div className="rounded-3xl border border-[#2d2d31] bg-[#18181b] p-5 dark:border-gray-200 dark:bg-white">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#0f0f12] dark:bg-gray-50">
          {icon}
        </div>
        <div>
          <h3 className="text-white dark:text-gray-900">{title}</h3>
          <p className="text-sm text-gray-400 dark:text-gray-600">{description}</p>
        </div>
      </div>
      <div className="mt-4 break-all rounded-2xl border border-dashed border-[#2d2d31] bg-[#0f0f12] px-4 py-3 text-sm text-gray-300 dark:border-gray-200 dark:bg-gray-50 dark:text-gray-700">
        {value}
      </div>
    </div>
  )
}
