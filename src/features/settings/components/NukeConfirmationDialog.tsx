import { useState, useEffect } from 'react'
import type { CSSProperties } from 'react'
import { AlertTriangle, X, RefreshCw, Trash2 } from 'lucide-react'
import { Capacitor } from '@capacitor/core'
import { useLanguage } from '../../../context/LanguageContext'
import { useAuth } from '../../../context/AuthContext'
import { useNukeAccount } from '../hooks/useNukeAccount'

const COUNTDOWN_SECONDS = 5

type Step = 1 | 2 | 3

const overlayStyle: CSSProperties = {
  alignItems: 'center',
  backgroundColor: 'rgba(0, 0, 0, 0.72)',
  display: 'flex',
  inset: 0,
  justifyContent: 'center',
  padding: '1rem',
  position: 'fixed',
  zIndex: 50,
}

const dialogStyle: CSSProperties = {
  background: '#18181b',
  border: '1px solid #2d2d31',
  borderRadius: '18px',
  boxShadow: '0 24px 80px rgba(0, 0, 0, 0.55)',
  color: '#ffffff',
  display: 'block',
  margin: 0,
  maxHeight: 'calc(100vh - 2rem)',
  maxWidth: '460px',
  overflow: 'hidden',
  padding: 0,
  position: 'relative',
  width: 'min(460px, calc(100vw - 2rem))',
}

const secondaryButtonStyle: CSSProperties = {
  alignItems: 'center',
  backgroundColor: 'transparent',
  border: '1px solid #3d3d41',
  borderRadius: '10px',
  color: '#d7d7de',
  display: 'inline-flex',
  fontSize: '0.875rem',
  fontWeight: 600,
  justifyContent: 'center',
  minHeight: '40px',
  padding: '0.625rem 1rem',
}

const primaryButtonStyle: CSSProperties = {
  alignItems: 'center',
  backgroundColor: '#ff4444',
  border: '1px solid #ff4444',
  borderRadius: '10px',
  color: '#ffffff',
  display: 'inline-flex',
  fontSize: '0.875rem',
  fontWeight: 700,
  gap: '0.5rem',
  justifyContent: 'center',
  minHeight: '40px',
  padding: '0.625rem 1rem',
}

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
  const primaryDisabled =
    (step === 2 && usernameInput.toLowerCase() !== user?.username?.toLowerCase()) ||
    (step === 3 && (countdown > 0 || isDeleting || isRefreshing))

  return (
    <div style={overlayStyle}>
      <dialog
        open
        aria-modal="true"
        aria-labelledby="nuke-dialog-title"
        style={dialogStyle}
      >
        <div style={{ display: 'flex', gap: '0.375rem', padding: '1.25rem 1.25rem 0' }}>
          {([1, 2, 3] as const).map(s => (
            <div
              key={s}
              style={{
                backgroundColor: s <= step ? '#ff4444' : '#2d2d31',
                borderRadius: '999px',
                flex: 1,
                height: '4px',
              }}
            />
          ))}
        </div>

        <div
          style={{
            alignItems: 'flex-start',
            display: 'flex',
            gap: '0.875rem',
            justifyContent: 'space-between',
            padding: '1.125rem 1.25rem',
          }}
        >
          <div style={{ alignItems: 'center', display: 'flex', gap: '0.75rem', minWidth: 0 }}>
            <div
              style={{
                alignItems: 'center',
                backgroundColor: 'rgba(255, 68, 68, 0.14)',
                borderRadius: '12px',
                display: 'flex',
                flexShrink: 0,
                height: '40px',
                justifyContent: 'center',
                width: '40px',
              }}
            >
              <AlertTriangle className="w-5 h-5 text-[#ff4444]" />
            </div>
            <div style={{ minWidth: 0 }}>
              <h2
                id="nuke-dialog-title"
                style={{ color: '#ffffff', fontSize: '1rem', fontWeight: 700, margin: 0 }}
              >
                {stepTitles[step]}
              </h2>
              <p style={{ color: '#9ca3af', fontSize: '0.8125rem', margin: '0.125rem 0 0' }}>
                {t('settings.nuke.dialog.subtitle')}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting || isRefreshing}
            aria-label={t('settings.nuke.dialog.cancel')}
            style={{
              alignItems: 'center',
              backgroundColor: 'transparent',
              border: 0,
              color: '#8b8b98',
              display: 'flex',
              height: '32px',
              justifyContent: 'center',
              opacity: isDeleting || isRefreshing ? 0.45 : 1,
              width: '32px',
            }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div style={{ borderTop: '1px solid #2d2d31', padding: '1.25rem' }}>
          {step === 1 && (
            <>
              <p style={{ color: '#b7b7c5', fontSize: '0.875rem', lineHeight: 1.55, margin: 0 }}>
                {t('settings.nuke.dialog.step1.description')}
              </p>
              <ul style={{ display: 'grid', gap: '0.625rem', margin: '1rem 0 0', padding: 0 }}>
                {(['item1', 'item2', 'item3', 'item4'] as const).map(item => (
                  <li
                    key={item}
                    style={{
                      alignItems: 'center',
                      color: '#e6e6ee',
                      display: 'flex',
                      fontSize: '0.875rem',
                      gap: '0.625rem',
                    }}
                  >
                    <span
                      style={{
                        backgroundColor: '#ff4444',
                        borderRadius: '999px',
                        flexShrink: 0,
                        height: '6px',
                        width: '6px',
                      }}
                    />
                    {t(`settings.nuke.dialog.step1.${item}`)}
                  </li>
                ))}
              </ul>
            </>
          )}

          {step === 2 && (
            <>
              <p style={{ color: '#b7b7c5', fontSize: '0.875rem', lineHeight: 1.55, margin: 0 }}>
                {t('settings.nuke.dialog.step2.description')}
              </p>
              <input
                type="text"
                value={usernameInput}
                onChange={e => setUsernameInput(e.target.value)}
                placeholder={t('settings.nuke.dialog.step2.placeholder')}
                autoComplete="off"
                data-testid="username-input"
                style={{
                  backgroundColor: '#0e0e10',
                  border: '1px solid #3d3d41',
                  borderRadius: '10px',
                  color: '#ffffff',
                  fontSize: '0.875rem',
                  marginTop: '1rem',
                  outline: 'none',
                  padding: '0.75rem 0.875rem',
                  width: '100%',
                }}
              />
            </>
          )}

          {step === 3 && (
            <>
              <p style={{ color: '#b7b7c5', fontSize: '0.875rem', lineHeight: 1.55, margin: 0 }}>
                {t('settings.nuke.dialog.step3.description')}
              </p>
              {isRefreshing && (
                <div
                  role="status"
                  style={{
                    alignItems: 'center',
                    backgroundColor: 'rgba(145, 70, 255, 0.1)',
                    border: '1px solid rgba(145, 70, 255, 0.3)',
                    borderRadius: '12px',
                    display: 'flex',
                    gap: '0.75rem',
                    marginTop: '1rem',
                    padding: '0.75rem 0.875rem',
                  }}
                >
                  <RefreshCw className="w-4 h-4 text-[#9146FF] animate-spin flex-shrink-0" />
                  <p style={{ color: '#c9a4ff', fontSize: '0.875rem', margin: 0 }}>
                    {t('settings.nuke.refreshing')}
                  </p>
                </div>
              )}
              {error && !isRefreshing && (
                <p
                  role="alert"
                  style={{
                    backgroundColor: 'rgba(255, 68, 68, 0.1)',
                    border: '1px solid rgba(255, 68, 68, 0.3)',
                    borderRadius: '12px',
                    color: '#ff8080',
                    fontSize: '0.875rem',
                    margin: '1rem 0 0',
                    padding: '0.75rem 0.875rem',
                  }}
                >
                  {t('settings.nuke.error')}
                </p>
              )}
            </>
          )}
        </div>

        <div
          style={{
            alignItems: 'center',
            borderTop: '1px solid #2d2d31',
            display: 'flex',
            gap: '0.75rem',
            justifyContent: step > 1 ? 'space-between' : 'flex-end',
            padding: '1rem 1.25rem',
          }}
        >
          {step > 1 && !isDeleting && !isRefreshing && (
            <button type="button" onClick={() => setStep(prevStep)} style={secondaryButtonStyle}>
              {t('settings.nuke.dialog.back')}
            </button>
          )}

          <div style={{ display: 'flex', gap: '0.625rem', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting || isRefreshing}
              style={{
                ...secondaryButtonStyle,
                opacity: isDeleting || isRefreshing ? 0.45 : 1,
              }}
            >
              {t('settings.nuke.dialog.cancel')}
            </button>

            {step === 1 && (
              <button type="button" onClick={() => setStep(2)} style={primaryButtonStyle}>
                {t('settings.nuke.dialog.step1.continue')}
              </button>
            )}

            {step === 2 && (
              <button
                type="button"
                onClick={handleConfirmStep2}
                disabled={primaryDisabled}
                style={{
                  ...primaryButtonStyle,
                  cursor: primaryDisabled ? 'not-allowed' : 'pointer',
                  opacity: primaryDisabled ? 0.45 : 1,
                }}
              >
                {t('settings.nuke.dialog.step2.confirm')}
              </button>
            )}

            {step === 3 && (
              <button
                type="button"
                onClick={handleNuke}
                disabled={primaryDisabled}
                style={{
                  ...primaryButtonStyle,
                  cursor: primaryDisabled ? 'not-allowed' : 'pointer',
                  opacity: primaryDisabled ? 0.5 : 1,
                }}
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
