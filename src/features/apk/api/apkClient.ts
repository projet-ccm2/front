const USER_MANAGEMENT_URL =
  globalThis._env_?.AUTH_SERVICE_URL ||
  import.meta.env.VITE_AUTH_SERVICE_URL ||
  'http://localhost:3000'

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
  async getDownloadUrl(accessToken: string): Promise<string> {
    const response = await fetch(`${USER_MANAGEMENT_URL}/apk/download`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
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
