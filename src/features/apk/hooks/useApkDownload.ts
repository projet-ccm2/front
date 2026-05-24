import { useState } from 'react'
import { toast } from 'sonner'
import { Capacitor } from '@capacitor/core'
import { apkClient } from '../api/apkClient'
import { useAuth } from '../../../context/AuthContext'
import { getStoredIdToken, isIdTokenExpired } from '../../../utils/auth'

export function useApkDownload() {
  const { login } = useAuth()
  const [isDownloading, setIsDownloading] = useState(false)

  const triggerDownload = async (errorMessages: { service: string }) => {
    const idToken = getStoredIdToken()
    if (!idToken) {
      toast.error(errorMessages.service)
      return
    }
    if (isIdTokenExpired(idToken)) {
      const storage = Capacitor.isNativePlatform() ? localStorage : sessionStorage
      storage.setItem('return_to_screen', 'dashboard')
      await login()
      return
    }
    setIsDownloading(true)
    try {
      const url = await apkClient.getDownloadUrl(idToken)
      globalThis.open(url, '_blank')
    } catch {
      toast.error(errorMessages.service)
    } finally {
      setIsDownloading(false)
    }
  }

  return { triggerDownload, isDownloading }
}
