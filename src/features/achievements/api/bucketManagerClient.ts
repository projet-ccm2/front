const BUCKET_MANAGER_SERVICE_URL =
  globalThis._env_?.BUCKET_MANAGER_SERVICE_URL ||
  import.meta.env.VITE_BUCKET_MANAGER_SERVICE_URL ||
  'http://localhost:3002'

export class BucketManagerError extends Error {
  readonly status: number
  readonly details?: unknown

  constructor(message: string, status: number, details?: unknown) {
    super(message)
    this.name = 'BucketManagerError'
    this.status = status
    this.details = details
  }
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${BUCKET_MANAGER_SERVICE_URL}${path}`, init)

  if (!response.ok) {
    let details: unknown = null

    try {
      details = await response.json()
    } catch {
      details = await response.text()
    }

    throw new BucketManagerError(
      `Bucket-manager request failed with status ${response.status}`,
      response.status,
      details
    )
  }

  return response.json() as Promise<T>
}

export interface BucketUploadResponse {
  success: boolean
  key: string
  message: string
  timestamp: string
}

export const bucketManagerClient = {
  uploadAchievementImage(file: File, elementId: string) {
    const formData = new FormData()
    formData.append('image', file)
    formData.append('typeImage', 'achievement')
    formData.append('elementId', elementId)

    return requestJson<BucketUploadResponse>('/bucket/image/insert', {
      method: 'POST',
      body: formData,
    }).then(response => response.key)
  },
}
