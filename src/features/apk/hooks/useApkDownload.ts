import { useState } from 'react'
import { toast } from 'sonner'
import { apkClient } from '../api/apkClient'

function getIdToken(): string | null {
  try {
    const raw = localStorage.getItem('twitch_tokens')
    if (!raw) return null
    return (JSON.parse(raw) as { idToken: string }).idToken ?? null
  } catch {
    return null
  }
}

export function useApkDownload() {
  const [isDownloading, setIsDownloading] = useState(false)

  const triggerDownload = async (errorMessages: { service: string }) => {
    const idToken = getIdToken()
    if (!idToken) {
      toast.error(errorMessages.service)
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
