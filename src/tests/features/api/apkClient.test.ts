import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { apkClient, ApkError } from '../../../features/apk/api/apkClient'

const DOWNLOAD_URL = 'https://storage.googleapis.com/bucket/app.apk'

describe('apkClient', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('should return the download URL on a successful response', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ url: DOWNLOAD_URL }),
    } as Response)

    await expect(apkClient.getDownloadUrl('id-token')).resolves.toBe(DOWNLOAD_URL)
  })

  it('should send the idToken as Authorization Bearer header', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ url: DOWNLOAD_URL }),
    } as Response)

    await apkClient.getDownloadUrl('id-token')

    const [, init] = vi.mocked(fetch).mock.calls[0]
    expect((init?.headers as Record<string, string>)['Authorization']).toBe('Bearer id-token')
  })

  it('should throw ApkError with json details on non-ok response', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 403,
      json: () => Promise.resolve({ message: 'Forbidden' }),
    } as Response)

    await apkClient.getDownloadUrl('id-token').catch((err: ApkError) => {
      expect(err).toBeInstanceOf(ApkError)
      expect(err.status).toBe(403)
      expect(err.details).toEqual({ message: 'Forbidden' })
    })
  })

  it('should fall back to text() when json() throws on a non-ok response', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 500,
      json: () => { throw new Error('invalid json') },
      text: () => Promise.resolve('Internal Server Error'),
    } as unknown as Response)

    await apkClient.getDownloadUrl('id-token').catch((err: ApkError) => {
      expect(err).toBeInstanceOf(ApkError)
      expect(err.status).toBe(500)
      expect(err.details).toBe('Internal Server Error')
    })
  })
})
