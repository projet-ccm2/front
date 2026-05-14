import { useState, useEffect } from 'react'
import { AlertTriangle, X } from 'lucide-react'
import { useLanguage } from '../../../context/LanguageContext'
import { useAuth } from '../../../context/AuthContext'
import { useNukeAccount } from '../hooks/useNukeAccount'

const COUNTDOWN_SECONDS = 5

function isIdTokenExpired(idToken: string): boolean {
  try {
    const payload = idToken.split('.')[1]
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/'))) as { exp?: number }
    if (typeof decoded.exp !== 'number') return false
    return decoded.exp < Math.floor(Date.now() / 1000)
  } catch {
    return false
  }
}

interface NukeConfirmationDialogProps {
  readonly onClose: () => void
  readonly onNuked: () => void
}

export function NukeConfirmationDialog({ onClose, onNuked }: NukeConfirmationDialogProps) {
  const { t } = useLanguage()
  const { user, logout } = useAuth()
  const { nuke, isDeleting, error } = useNukeAccount()

  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [usernameInput, setUsernameInput] = useState('')
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS)
  const [sessionExpired, setSessionExpired] = useState(false)

  useEffect(() => {
    if (step !== 3) return
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [step])

  const handleConfirmStep2 = () => {
    if (usernameInput.toLowerCase() !== user?.username?.toLowerCase()) return
    setCountdown(COUNTDOWN_SECONDS)
    setStep(3)
  }

  const handleNuke = async () => {
    const raw = localStorage.getItem('twitch_tokens')
    if (!raw) return
    let parsedTokens: {
      accessToken: string
      idToken: string
      tokenType?: string
      expiresIn?: number
      scope?: string[]
      state?: string
    }
    try {
      parsedTokens = JSON.parse(raw)
    } catch {
      return
    }
    if (isIdTokenExpired(parsedTokens.idToken)) {
      setSessionExpired(true)
      return
    }
    await nuke(parsedTokens, onNuked)
  }

  const handleSignOut = () => {
    logout()
    onClose()
  }

  const stepTitles: Record<1 | 2 | 3, string> = {
    1: t('settings.nuke.dialog.step1.title'),
    2: t('settings.nuke.dialog.step2.title'),
    3: t('settings.nuke.dialog.step3.title'),
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="nuke-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
    >
      <div className="bg-[#18181b] dark:bg-white border border-[#2d2d31] dark:border-gray-200 rounded-xl w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#2d2d31] dark:border-gray-200">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <h2 id="nuke-dialog-title" className="font-semibold text-white dark:text-gray-900">
              {stepTitles[step]}
            </h2>
          </div>
          <button
            onClick={onClose}
            disabled={isDeleting}
            aria-label={t('settings.nuke.dialog.cancel')}
            className="text-gray-400 hover:text-white dark:text-gray-500 dark:hover:text-gray-900 disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {step === 1 && (
            <>
              <p className="text-gray-300 dark:text-gray-700 text-sm">
                {t('settings.nuke.dialog.step1.description')}
              </p>
              <ul className="space-y-2 text-sm text-gray-400 dark:text-gray-600">
                {(['item1', 'item2', 'item3', 'item4'] as const).map(item => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                    {t(`settings.nuke.dialog.step1.${item}`)}
                  </li>
                ))}
              </ul>
            </>
          )}

          {step === 2 && (
            <>
              <p className="text-gray-300 dark:text-gray-700 text-sm">
                {t('settings.nuke.dialog.step2.description')}
              </p>
              <input
                type="text"
                value={usernameInput}
                onChange={e => setUsernameInput(e.target.value)}
                placeholder={t('settings.nuke.dialog.step2.placeholder')}
                className="w-full bg-[#0e0e10] dark:bg-gray-100 border border-[#2d2d31] dark:border-gray-300 rounded-lg px-4 py-2.5 text-sm text-white dark:text-gray-900 placeholder-gray-500 focus:outline-none focus:border-red-500"
                autoComplete="off"
                data-testid="username-input"
              />
            </>
          )}

          {step === 3 && (
            <>
              <p className="text-gray-300 dark:text-gray-700 text-sm">
                {t('settings.nuke.dialog.step3.description')}
              </p>
              {sessionExpired && (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30" role="alert">
                  <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-yellow-300 text-sm">{t('settings.nuke.sessionExpired')}</p>
                    <button
                      onClick={handleSignOut}
                      className="mt-2 text-sm font-medium text-yellow-400 hover:text-yellow-300 underline"
                    >
                      {t('settings.nuke.signOut')}
                    </button>
                  </div>
                </div>
              )}
              {error && !sessionExpired && (
                <p className="text-red-400 text-sm" role="alert">
                  {t('settings.nuke.error')}
                </p>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-5 border-t border-[#2d2d31] dark:border-gray-200 gap-3">
          <div className="flex gap-2">
            {step > 1 && !isDeleting && (
              <button
                onClick={() => setStep(s => (s === 3 ? 2 : 1) as 1 | 2 | 3)}
                className="px-4 py-2 text-sm text-gray-400 hover:text-white dark:text-gray-600 dark:hover:text-gray-900 transition-colors"
              >
                {t('settings.nuke.dialog.back')}
              </button>
            )}
          </div>

          <div className="flex gap-2 ml-auto">
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="px-4 py-2 text-sm rounded-lg border border-[#2d2d31] dark:border-gray-200 text-gray-300 dark:text-gray-700 hover:bg-[#2d2d31] dark:hover:bg-gray-100 disabled:opacity-50 transition-colors"
            >
              {t('settings.nuke.dialog.cancel')}
            </button>

            {step === 1 && (
              <button
                onClick={() => setStep(2)}
                className="px-4 py-2 text-sm rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors"
              >
                {t('settings.nuke.dialog.step1.continue')}
              </button>
            )}

            {step === 2 && (
              <button
                onClick={handleConfirmStep2}
                disabled={usernameInput.toLowerCase() !== user?.username?.toLowerCase()}
                className="px-4 py-2 text-sm rounded-lg bg-red-600 hover:bg-red-700 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {t('settings.nuke.dialog.step2.confirm')}
              </button>
            )}

            {step === 3 && (
              <button
                onClick={handleNuke}
                disabled={countdown > 0 || isDeleting || sessionExpired}
                className="px-4 py-2 text-sm rounded-lg bg-red-600 hover:bg-red-700 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {isDeleting
                  ? t('settings.nuke.deleting')
                  : countdown > 0
                    ? t('settings.nuke.dialog.step3.countdown').replace(
                        '{seconds}',
                        String(countdown)
                      )
                    : t('settings.nuke.dialog.step3.confirm')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
