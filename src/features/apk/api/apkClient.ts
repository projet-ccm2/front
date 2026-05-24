import { AUTH_SERVICE_URL as USER_MANAGEMENT_URL } from '../../../config/environment'
import { fetchGcpIdentityToken } from '../../../utils/gcpAuth'

export class ApkError extends Error {
  readonly status: number
  readonly details?: unknown

  constructor(message: string, status: number, details?: unknown) {
    super(message)
    this.name = 'ApkError'
    this.status = status
    this.details = details
  }
}

export const apkClient = {
  async getDownloadUrl(): Promise<string> {
    const identityToken = await fetchGcpIdentityToken(USER_MANAGEMENT_URL)
    const response = await fetch(`${USER_MANAGEMENT_URL}/apk/download`, {
      headers: {
        Authorization: `Bearer ${identityToken}`,
      },
    })

    if (!response.ok) {
      let details: unknown = null
      try {
        details = await response.json()
      } catch {
        details = await response.text()
      }
      throw new ApkError(
        `APK download request failed with status ${response.status}`,
        response.status,
        details
      )
    }

    const data = await response.json()
    return data.url as string
  },
}
