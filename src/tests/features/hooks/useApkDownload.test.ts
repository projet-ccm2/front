import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '../../utils/test-utils'
import { useApkDownload } from '../../../features/apk/hooks/useApkDownload'

vi.mock('../../../utils/browserRuntime', () => ({
  openExternalUrl: vi.fn(),
  closeExternalUrl: vi.fn(),
  getLaunchUrl: vi.fn().mockResolvedValue({ url: null }),
  addUrlOpenListener: vi.fn().mockResolvedValue({ remove: vi.fn() }),
}))

vi.mock('../../../features/apk/api/apkClient', async importOriginal => {
  const actual = await importOriginal<typeof import('../../../features/apk/api/apkClient')>()
  return {
    ...actual,
    apkClient: { getDownloadUrl: vi.fn() },
  }
})

vi.mock('sonner', () => ({ toast: { error: vi.fn(), success: vi.fn() } }))

const { apkClient } = await import('../../../features/apk/api/apkClient')
const { toast } = await import('sonner')

const errorMessages = { service: 'Service error' }
const DOWNLOAD_URL = 'https://storage.googleapis.com/bucket/app.apk'

describe('useApkDownload', () => {
  beforeEach(() => {
    localStorage.setItem('twitch_tokens', JSON.stringify({ idToken: 'valid-id-token' }))
    vi.stubGlobal('open', vi.fn())
    vi.clearAllMocks()
  })

  afterEach(() => {
    localStorage.clear()
    vi.unstubAllGlobals()
  })

  it('should open the download URL on success', async () => {
    vi.mocked(apkClient.getDownloadUrl).mockResolvedValue(DOWNLOAD_URL)

    const { result } = renderHook(() => useApkDownload())

    await act(async () => {
      await result.current.triggerDownload(errorMessages)
    })

    expect(apkClient.getDownloadUrl).toHaveBeenCalledWith('valid-id-token')
    expect(globalThis.open).toHaveBeenCalledWith(DOWNLOAD_URL, '_blank')
    expect(result.current.isDownloading).toBe(false)
  })

  it('should show service error toast when the request fails', async () => {
    vi.mocked(apkClient.getDownloadUrl).mockRejectedValue(new Error('Network error'))

    const { result } = renderHook(() => useApkDownload())

    await act(async () => {
      await result.current.triggerDownload(errorMessages)
    })

    expect(toast.error).toHaveBeenCalledWith(errorMessages.service)
    expect(result.current.isDownloading).toBe(false)
  })

  it('should show error toast and skip client call when no idToken in storage', async () => {
    localStorage.removeItem('twitch_tokens')

    const { result } = renderHook(() => useApkDownload())

    await act(async () => {
      await result.current.triggerDownload(errorMessages)
    })

    expect(toast.error).toHaveBeenCalledWith(errorMessages.service)
    expect(apkClient.getDownloadUrl).not.toHaveBeenCalled()
  })

  it('should show error toast and skip client call when twitch_tokens has no idToken field', async () => {
    localStorage.setItem('twitch_tokens', JSON.stringify({ accessToken: 'only-access' }))

    const { result } = renderHook(() => useApkDownload())

    await act(async () => {
      await result.current.triggerDownload(errorMessages)
    })

    expect(toast.error).toHaveBeenCalledWith(errorMessages.service)
    expect(apkClient.getDownloadUrl).not.toHaveBeenCalled()
  })

  it('should show error toast and skip client call when twitch_tokens is invalid JSON', async () => {
    localStorage.setItem('twitch_tokens', 'not-valid-json')

    const { result } = renderHook(() => useApkDownload())

    await act(async () => {
      await result.current.triggerDownload(errorMessages)
    })

    expect(toast.error).toHaveBeenCalledWith(errorMessages.service)
    expect(apkClient.getDownloadUrl).not.toHaveBeenCalled()
  })

  it('should trigger login and set return_to_screen when idToken is expired', async () => {
    const expiredPayload = btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) - 1 }))
      .replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '')
    localStorage.setItem('twitch_tokens', JSON.stringify({ idToken: `h.${expiredPayload}.s` }))

    const { openExternalUrl } = await import('../../../utils/browserRuntime')

    const { result } = renderHook(() => useApkDownload())

    await act(async () => {
      await result.current.triggerDownload(errorMessages)
    })

    expect(apkClient.getDownloadUrl).not.toHaveBeenCalled()
    expect(toast.error).not.toHaveBeenCalled()
    expect(sessionStorage.getItem('return_to_screen')).toBe('dashboard')
    expect(openExternalUrl).toHaveBeenCalled()
  })
})
