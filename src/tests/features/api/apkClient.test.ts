import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { apkClient, ApkError } from '../../../features/apk/api/apkClient'

const GCP_TOKEN = 'gcp-identity-token'
const DOWNLOAD_URL = 'https://storage.googleapis.com/bucket/app.apk'

function mockMetadataOk() {
  return {
    ok: true,
    text: () => Promise.resolve(GCP_TOKEN),
  } as unknown as Response
}

describe('apkClient', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('should return the download URL on a successful response', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(mockMetadataOk())
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ url: DOWNLOAD_URL }),
      } as Response)

    await expect(apkClient.getDownloadUrl()).resolves.toBe(DOWNLOAD_URL)
  })

  it('should send the GCP identity token as Authorization header', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(mockMetadataOk())
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ url: DOWNLOAD_URL }),
      } as Response)

    await apkClient.getDownloadUrl()

    const [, apiCall] = vi.mocked(fetch).mock.calls
    const headers = apiCall[1]?.headers as Record<string, string>
    expect(headers['Authorization']).toBe(`Bearer ${GCP_TOKEN}`)
  })

  it('should throw when metadata fetch fails', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({ ok: false, status: 503 } as Response)

    await expect(apkClient.getDownloadUrl()).rejects.toThrow()
  })

  it('should throw ApkError with json details on non-ok API response', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(mockMetadataOk())
      .mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: () => Promise.resolve({ message: 'Forbidden' }),
      } as Response)

    await apkClient.getDownloadUrl().catch((err: ApkError) => {
      expect(err).toBeInstanceOf(ApkError)
      expect(err.status).toBe(403)
      expect(err.details).toEqual({ message: 'Forbidden' })
    })
  })

  it('should fall back to text() when json() throws on a non-ok API response', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(mockMetadataOk())
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => { throw new Error('invalid json') },
        text: () => Promise.resolve('Internal Server Error'),
      } as unknown as Response)

    await apkClient.getDownloadUrl().catch((err: ApkError) => {
      expect(err).toBeInstanceOf(ApkError)
      expect(err.status).toBe(500)
      expect(err.details).toBe('Internal Server Error')
    })
  })
})
