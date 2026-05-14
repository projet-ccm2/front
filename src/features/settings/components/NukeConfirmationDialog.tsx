import { useState, useEffect } from 'react'
import { AlertTriangle, X, RefreshCw, Trash2 } from 'lucide-react'
import { Capacitor } from '@capacitor/core'
import { useLanguage } from '../../../context/LanguageContext'
import { useAuth } from '../../../context/AuthContext'
import { useNukeAccount } from '../hooks/useNukeAccount'

const COUNTDOWN_SECONDS = 5

type Step = 1 | 2 | 3

function isIdTokenExpired(idToken: string): boolean {
  try {
    const payload = idToken.split('.')[1]
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/'))) as {
      exp?: number
    }
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
  const { user, login } = useAuth()
  const { nuke, isDeleting, error } = useNukeAccount()

  const [step, setStep] = useState<Step>(1)
  const [usernameInput, setUsernameInput] = useState('')
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS)
  const [isRefreshing, setIsRefreshing] = useState(false)

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
      setIsRefreshing(true)
      const storage = Capacitor.isNativePlatform() ? localStorage : sessionStorage
      storage.setItem('return_to_screen', 'settings')
      await login()
      return
    }

    await nuke(parsedTokens, onNuked)
  }

  const stepTitles: Record<1 | 2 | 3, string> = {
    1: t('settings.nuke.dialog.step1.title'),
    2: t('settings.nuke.dialog.step2.title'),
    3: t('settings.nuke.dialog.step3.title'),
  }

  const prevStep: Step = step === 3 ? 2 : 1

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <dialog
        open
        aria-modal="true"
        aria-labelledby="nuke-dialog-title"
        className="bg-[#18181b] dark:bg-white border border-[#2d2d31] dark:border-gray-200 rounded-2xl w-full max-w-md shadow-2xl p-0 m-0"
      >
        {/* Step indicator */}
        <div className="flex items-center gap-1.5 px-6 pt-5">
          {([1, 2, 3] as const).map(s => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full transition-colors ${
                s <= step ? 'bg-red-500' : 'bg-[#2d2d31] dark:bg-gray-200'
              }`}
            />
          ))}
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-500/15">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <h2 id="nuke-dialog-title" className="font-semibold text-white dark:text-gray-900">
              {stepTitles[step]}
            </h2>
          </div>
          <button
            onClick={onClose}
            disabled={isDeleting || isRefreshing}
            aria-label={t('settings.nuke.dialog.cancel')}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-[#2d2d31] hover:text-gray-300 dark:hover:bg-gray-100 dark:hover:text-gray-700 disabled:opacity-40"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Divider */}
        <div className="border-t border-[#2d2d31] dark:border-gray-200" />

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {step === 1 && (
            <>
              <p className="text-sm text-gray-400 dark:text-gray-600 leading-relaxed">
                {t('settings.nuke.dialog.step1.description')}
              </p>
              <ul className="space-y-2.5 text-sm">
                {(['item1', 'item2', 'item3', 'item4'] as const).map(item => (
                  <li key={item} className="flex items-center gap-2.5 text-gray-300 dark:text-gray-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                    {t(`settings.nuke.dialog.step1.${item}`)}
                  </li>
                ))}
              </ul>
            </>
          )}

          {step === 2 && (
            <>
              <p className="text-sm text-gray-400 dark:text-gray-600 leading-relaxed">
                {t('settings.nuke.dialog.step2.description')}
              </p>
              <input
                type="text"
                value={usernameInput}
                onChange={e => setUsernameInput(e.target.value)}
                placeholder={t('settings.nuke.dialog.step2.placeholder')}
                className="w-full bg-[#0f0f12] dark:bg-gray-100 border border-[#2d2d31] dark:border-gray-300 rounded-xl px-4 py-3 text-sm text-white dark:text-gray-900 placeholder-gray-600 focus:outline-none focus:border-red-500 transition-colors"
                autoComplete="off"
                data-testid="username-input"
              />
            </>
          )}

          {step === 3 && (
            <>
              <p className="text-sm text-gray-400 dark:text-gray-600 leading-relaxed">
                {t('settings.nuke.dialog.step3.description')}
              </p>
              {isRefreshing && (
                <div className="flex items-center gap-3 rounded-xl bg-[#9146FF]/10 border border-[#9146FF]/30 px-4 py-3" role="status">
                  <RefreshCw className="w-4 h-4 text-[#9146FF] animate-spin flex-shrink-0" />
                  <p className="text-sm text-[#c9a4ff] dark:text-[#7c3aed]">
                    {t('settings.nuke.refreshing')}
                  </p>
                </div>
              )}
              {error && !isRefreshing && (
                <p
                  className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400 dark:text-red-600"
                  role="alert"
                >
                  {t('settings.nuke.error')}
                </p>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#2d2d31] dark:border-gray-200 gap-3">
          <div>
            {step > 1 && !isDeleting && !isRefreshing && (
              <button
                onClick={() => setStep(prevStep)}
                className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-gray-200 dark:text-gray-500 dark:hover:text-gray-700 transition-colors rounded-lg hover:bg-[#2d2d31] dark:hover:bg-gray-100"
              >
                {t('settings.nuke.dialog.back')}
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              disabled={isDeleting || isRefreshing}
              className="px-5 py-2.5 text-sm font-medium rounded-xl border border-[#2d2d31] dark:border-gray-300 text-gray-300 dark:text-gray-700 hover:bg-[#2d2d31] dark:hover:bg-gray-100 disabled:opacity-40 transition-colors"
            >
              {t('settings.nuke.dialog.cancel')}
            </button>

            {step === 1 && (
              <button
                onClick={() => setStep(2)}
                className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-red-600 hover:bg-red-500 text-white shadow-md shadow-red-900/40 transition-all active:scale-95"
              >
                {t('settings.nuke.dialog.step1.continue')}
              </button>
            )}

            {step === 2 && (
              <button
                onClick={handleConfirmStep2}
                disabled={usernameInput.toLowerCase() !== user?.username?.toLowerCase()}
                className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-red-600 hover:bg-red-500 text-white shadow-md shadow-red-900/40 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
              >
                {t('settings.nuke.dialog.step2.confirm')}
              </button>
            )}

            {step === 3 && (
              <button
                onClick={handleNuke}
                disabled={countdown > 0 || isDeleting || isRefreshing}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl bg-red-600 hover:bg-red-500 text-white shadow-md shadow-red-900/40 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
              >
                {isRefreshing ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : isDeleting ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    {t('settings.nuke.deleting')}
                  </>
                ) : countdown > 0 ? (
                  t('settings.nuke.dialog.step3.countdown').replace('{seconds}', String(countdown))
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    {t('settings.nuke.dialog.step3.confirm')}
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </dialog>
    </div>
  )
}
