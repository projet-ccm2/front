import { useRef, useState } from 'react'
import { Copy, Check, HelpCircle } from 'lucide-react'
import { useLanguage } from '../../../context/LanguageContext'
import { API_SERVICE_URL } from '../../../config/environment'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog'

interface Props {
  achievementId: string
}

export function ApiCallerEndpointInfo({ achievementId }: Readonly<Props>) {
  const { t } = useLanguage()
  const [copyState, setCopyState] = useState<'idle' | 'copied'>('idle')
  const [docsOpen, setDocsOpen] = useState(false)
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const url = `${API_SERVICE_URL}/achievements/validate`

  const handleCopy = async () => {
    if (!navigator.clipboard?.writeText) return
    try {
      await navigator.clipboard.writeText(url)
      setCopyState('copied')
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current)
      copyTimerRef.current = globalThis.setTimeout(() => setCopyState('idle'), 2000)
    } catch {
      // clipboard unavailable
    }
  }

  const requestBody = JSON.stringify(
    {
      twitch_token: '<user_twitch_oauth_token>',
      achievement_id: achievementId,
    },
    null,
    2
  )

  return (
    <div className="mt-3 pt-3 border-t border-[#2d2d31] dark:border-gray-200">
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
          {t('management.apicaller.endpoint.label')}
        </span>
        <div className="flex items-center gap-1.5 min-w-0 flex-1 bg-[#2d2d31] dark:bg-gray-100 rounded-lg px-3 py-1.5">
          <span className="text-xs font-mono text-[#9146FF] font-semibold flex-shrink-0">POST</span>
          <span className="text-xs font-mono text-gray-300 dark:text-gray-600 truncate">{url}</span>
        </div>
        <button
          aria-label={t('management.apicaller.endpoint.copy')}
          onClick={() => void handleCopy()}
          className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2d2d31] dark:bg-gray-100 hover:bg-[#3d3d41] dark:hover:bg-gray-200 text-gray-300 dark:text-gray-600 text-xs transition-colors"
        >
          {copyState === 'copied' ? (
            <Check className="w-3.5 h-3.5 text-[#00f593]" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
          <span className="hidden sm:inline">
            {copyState === 'copied'
              ? t('management.apicaller.endpoint.copied')
              : t('management.apicaller.endpoint.copy')}
          </span>
        </button>
        <button
          aria-label={t('management.apicaller.docs.open')}
          onClick={() => setDocsOpen(true)}
          className="flex-shrink-0 p-1.5 rounded-lg bg-[#2d2d31] dark:bg-gray-100 hover:bg-[#3d3d41] dark:hover:bg-gray-200 text-gray-400 dark:text-gray-500 hover:text-white dark:hover:text-gray-900 transition-colors"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>

      <Dialog open={docsOpen} onOpenChange={setDocsOpen}>
        <DialogContent className="bg-[#18181b] border-[#2d2d31] text-white dark:bg-white dark:border-gray-200 dark:text-gray-900 max-w-lg">
          <DialogHeader>
            <DialogTitle>{t('management.apicaller.docs.title')}</DialogTitle>
            <DialogDescription className="text-gray-400 dark:text-gray-600">
              {t('management.apicaller.docs.subtitle')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 text-sm">
            <div>
              <p className="text-gray-400 dark:text-gray-500 mb-1 text-xs uppercase tracking-wide">
                {t('management.apicaller.docs.method')}
              </p>
              <code className="block bg-[#2d2d31] dark:bg-gray-100 rounded-lg px-3 py-2 font-mono text-[#9146FF]">
                POST {url}
              </code>
            </div>

            <div>
              <p className="text-gray-400 dark:text-gray-500 mb-1 text-xs uppercase tracking-wide">
                {t('management.apicaller.docs.headers')}
              </p>
              <code className="block bg-[#2d2d31] dark:bg-gray-100 rounded-lg px-3 py-2 font-mono text-gray-300 dark:text-gray-600 text-xs">
                Content-Type: application/json
              </code>
            </div>

            <div>
              <p className="text-gray-400 dark:text-gray-500 mb-1 text-xs uppercase tracking-wide">
                {t('management.apicaller.docs.body')}
              </p>
              <pre className="bg-[#2d2d31] dark:bg-gray-100 rounded-lg px-3 py-2 font-mono text-xs text-gray-300 dark:text-gray-600 overflow-x-auto whitespace-pre">
                {requestBody}
              </pre>
              <ul className="mt-2 space-y-1 text-xs text-gray-400 dark:text-gray-500">
                <li>
                  <span className="text-gray-300 dark:text-gray-700 font-mono">twitch_token</span>
                  {' — '}
                  {t('management.apicaller.docs.body.twitch_token')}
                </li>
                <li>
                  <span className="text-gray-300 dark:text-gray-700 font-mono">achievement_id</span>
                  {' — '}
                  {t('management.apicaller.docs.body.achievement_id')}
                </li>
              </ul>
            </div>

            <div>
              <p className="text-gray-400 dark:text-gray-500 mb-1 text-xs uppercase tracking-wide">
                {t('management.apicaller.docs.responses')}
              </p>
              <ul className="space-y-1 text-xs">
                <li className="text-[#00f593]">{t('management.apicaller.docs.response.200')}</li>
                <li className="text-gray-400 dark:text-gray-500">
                  {t('management.apicaller.docs.response.400')}
                </li>
                <li className="text-gray-400 dark:text-gray-500">
                  {t('management.apicaller.docs.response.401')}
                </li>
                <li className="text-gray-400 dark:text-gray-500">
                  {t('management.apicaller.docs.response.409')}
                </li>
                <li className="text-gray-400 dark:text-gray-500">
                  {t('management.apicaller.docs.response.429')}
                </li>
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
