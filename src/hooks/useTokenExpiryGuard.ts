import { useEffect } from 'react'
import { toast } from 'sonner'
import { Capacitor } from '@capacitor/core'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { getStoredIdToken, isIdTokenExpired } from '../utils/auth'

export function useTokenExpiryGuard(currentScreen: string) {
  const { login, isAuthenticated } = useAuth()
  const { t } = useLanguage()

  useEffect(() => {
    if (!isAuthenticated) return
    const idToken = getStoredIdToken()
    if (!idToken || !isIdTokenExpired(idToken)) return

    toast.warning(t('auth.session.expired'))
    const storage = Capacitor.isNativePlatform() ? localStorage : sessionStorage
    storage.setItem('return_to_screen', currentScreen)

    const timer = setTimeout(() => {
      void login()
    }, 2000)

    return () => clearTimeout(timer)
  }, [currentScreen, isAuthenticated, login, t])
}
