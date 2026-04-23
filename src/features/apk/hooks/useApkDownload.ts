import { useState } from 'react'
import { toast } from 'sonner'
import { apkClient, ApkError } from '../api/apkClient'

function getAccessToken(): string | null {
  try {
    const raw = localStorage.getItem('twitch_tokens')
    if (!raw) return null
    return (JSON.parse(raw) as { accessToken: string }).accessToken ?? null
  } catch {
    return null
  }
}

export function useApkDownload() {
  const [isDownloading, setIsDownloading] = useState(false)

  const triggerDownload = async (errorMessages: { auth: string; service: string }) => {
    const token = getAccessToken()
    if (!token) return
    setIsDownloading(true)
    try {
      const url = await apkClient.getDownloadUrl(token)
      globalThis.open(url, '_blank')
    } catch (err) {
      toast.error(
        err instanceof ApkError && err.status === 401
          ? errorMessages.auth
          : errorMessages.service
      )
    } finally {
      setIsDownloading(false)
    }
  }

  return { triggerDownload, isDownloading }
}
