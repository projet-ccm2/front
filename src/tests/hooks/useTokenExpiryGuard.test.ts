import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook } from '../utils/test-utils'
import { useTokenExpiryGuard } from '../../hooks/useTokenExpiryGuard'

vi.mock('../../utils/browserRuntime', () => ({
  openExternalUrl: vi.fn(),
  closeExternalUrl: vi.fn(),
  getLaunchUrl: vi.fn().mockResolvedValue({ url: null }),
  addUrlOpenListener: vi.fn().mockResolvedValue({ remove: vi.fn() }),
}))

vi.mock('sonner', () => ({ toast: { warning: vi.fn(), error: vi.fn(), success: vi.fn() } }))

function makeJwt(exp: number): string {
  const payload = btoa(JSON.stringify({ exp }))
    .replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '')
  return `h.${payload}.s`
}

const now = () => Math.floor(Date.now() / 1000)

const authUser = {
  userId: 'user-1',
  username: 'streamer',
  channel: { id: 'ch-1', name: 'MyChannel', description: '', profileImageUrl: '' },
  channelsWhichIsMod: [],
}

describe('useTokenExpiryGuard', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    localStorage.setItem('twitch_user', JSON.stringify(authUser))
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.useRealTimers()
    localStorage.clear()
    sessionStorage.clear()
  })

  it('should do nothing when the token is valid', async () => {
    localStorage.setItem('twitch_tokens', JSON.stringify({ idToken: makeJwt(now() + 3600) }))
    const { toast } = await import('sonner')

    renderHook(() => useTokenExpiryGuard('dashboard'))

    expect(toast.warning).not.toHaveBeenCalled()
  })

  it('should do nothing when no token is stored', async () => {
    const { toast } = await import('sonner')

    renderHook(() => useTokenExpiryGuard('dashboard'))

    expect(toast.warning).not.toHaveBeenCalled()
  })

  it('should show a warning toast immediately when token is expired', async () => {
    localStorage.setItem('twitch_tokens', JSON.stringify({ idToken: makeJwt(now() - 1) }))
    const { toast } = await import('sonner')

    renderHook(() => useTokenExpiryGuard('dashboard'))

    expect(toast.warning).toHaveBeenCalledOnce()
  })

  it('should set return_to_screen to the current screen when expired', async () => {
    localStorage.setItem('twitch_tokens', JSON.stringify({ idToken: makeJwt(now() - 1) }))

    renderHook(() => useTokenExpiryGuard('discord'))

    expect(sessionStorage.getItem('return_to_screen')).toBe('discord')
  })

  it('should call login after 2 seconds when expired', async () => {
    localStorage.setItem('twitch_tokens', JSON.stringify({ idToken: makeJwt(now() - 1) }))
    const { openExternalUrl } = await import('../../utils/browserRuntime')

    renderHook(() => useTokenExpiryGuard('dashboard'))

    expect(openExternalUrl).not.toHaveBeenCalled()
    vi.advanceTimersByTime(2000)
    expect(openExternalUrl).toHaveBeenCalled()
  })

  it('should cancel login redirect if the component unmounts before 2 seconds', async () => {
    localStorage.setItem('twitch_tokens', JSON.stringify({ idToken: makeJwt(now() - 1) }))
    const { openExternalUrl } = await import('../../utils/browserRuntime')

    const { unmount } = renderHook(() => useTokenExpiryGuard('dashboard'))
    unmount()
    vi.advanceTimersByTime(2000)

    expect(openExternalUrl).not.toHaveBeenCalled()
  })
})
