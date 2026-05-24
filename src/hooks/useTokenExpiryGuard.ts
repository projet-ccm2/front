import { useEffect } from 'react'
import { toast } from 'sonner'
import { Capacitor } from '@capacitor/core'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { getStoredIdToken, isIdTokenExpired } from '../utils/auth'
import { FRONT_URL } from '../config/environment'

export function useTokenExpiryGuard(currentScreen: string) {
  const { login, isAuthenticated } = useAuth()
  const { t } = useLanguage()

  useEffect(() => {
    if (!isAuthenticated) return
    const idToken = getStoredIdToken()
    if (!idToken || !isIdTokenExpired(idToken)) return

    console.warn('[AUTH DEBUG] token expired — location.origin:', globalThis.location?.origin, '| FRONT_URL:', FRONT_URL, '| isNative:', Capacitor.isNativePlatform())

    const storage = Capacitor.isNativePlatform() ? localStorage : sessionStorage
    storage.setItem('return_to_screen', currentScreen)

    const timer = setTimeout(() => {
      void login()
    }, 2000)

    toast.warning(t('auth.session.expired'), {
      action: { label: 'Stop redirect', onClick: () => clearTimeout(timer) },
      duration: 10000,
    })

    return () => clearTimeout(timer)
  }, [currentScreen, isAuthenticated, login, t])
}
