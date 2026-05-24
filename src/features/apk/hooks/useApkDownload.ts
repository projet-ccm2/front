import { useState } from 'react'
import { toast } from 'sonner'
import { apkClient } from '../api/apkClient'

export function useApkDownload() {
  const [isDownloading, setIsDownloading] = useState(false)

  const triggerDownload = async (errorMessages: { service: string }) => {
    setIsDownloading(true)
    try {
      const url = await apkClient.getDownloadUrl()
      globalThis.open(url, '_blank')
    } catch {
      toast.error(errorMessages.service)
    } finally {
      setIsDownloading(false)
    }
  }

  return { triggerDownload, isDownloading }
}
