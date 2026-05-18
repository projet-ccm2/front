import { useState } from 'react'
import { toast } from 'sonner'
import { apkClient } from '../api/apkClient'

function getAccessToken(): string | null {
  const raw = localStorage.getItem('twitch_tokens')
  if (!raw) return null
  return (JSON.parse(raw) as { accessToken: string }).accessToken ?? null
}

export function useApkDownload() {
  const [isDownloading, setIsDownloading] = useState(false)

  const triggerDownload = async (errorMessages: { service: string }) => {
    const accessToken = getAccessToken()
    if (!accessToken) {
      toast.error(errorMessages.service)
      return
    }
    setIsDownloading(true)
    try {
      const url = await apkClient.getDownloadUrl(accessToken)
      globalThis.open(url, '_blank')
    } catch {
      toast.error(errorMessages.service)
    } finally {
      setIsDownloading(false)
    }
  }

  return { triggerDownload, isDownloading }
}
