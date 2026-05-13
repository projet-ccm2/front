import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHook, waitFor, act } from '../../utils/test-utils'
import { useViewerHub, fetchChannelInfosForIds } from '../../../features/viewer/hooks/useViewerHub'

const authUser = {
  userId: 'viewer-1',
  username: 'viewer',
  channel: {
    id: 'channel-1',
    name: 'Streamer',
    description: 'desc',
    profileImageUrl: '',
  },
  channelsWhichIsMod: [],
}

const mockAchievements = [
  {
    id: 'ach-1',
    title: 'First Steps',
    description: 'Send your first message',
    goal: 1,
    reward: 50,
    label: '',
    public: true,
    downloads: 0,
    visits: 0,
    active: true,
    secret: false,
    image: null,
    channelId: 'channel-1',
    type: { label: 'message', data: null },
    userState: { progressCount: 1, finished: true, acquiredDate: new Date().toISOString() },
  },
]

function makeErrorResponse(status: number, message = 'error') {
  return Promise.resolve({
    ok: false,
    status,
    json: () => Promise.resolve({ message }),
    text: () => Promise.resolve(message),
  } as Response)
}

describe('useViewerHub', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    localStorage.clear()
  })

  it('shows a sign-in message when the user is missing', async () => {
    const { result } = renderHook(() => useViewerHub())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.achievements).toEqual([])
    expect(result.current.errorMessage).toBe('Connecte-toi pour charger ton hub viewer.')
    expect(fetch).not.toHaveBeenCalled()
  })

  it('shows a sign-in message in English when the language is English', async () => {
    localStorage.setItem('stream-quest_language', 'en')

    const { result } = renderHook(() => useViewerHub())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.achievements).toEqual([])
    expect(result.current.errorMessage).toBe('Sign in to load your viewer hub.')
    expect(fetch).not.toHaveBeenCalled()
  })

  it('loads viewer achievements for the connected user', async () => {
    localStorage.setItem('twitch_user', JSON.stringify(authUser))
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockAchievements),
    } as Response)

    const { result } = renderHook(() => useViewerHub())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.achievements).toEqual(mockAchievements)
    expect(result.current.errorMessage).toBeNull()
  })


  it('returns empty channelInfoById when no twitch_tokens are stored', async () => {
    localStorage.setItem('twitch_user', JSON.stringify(authUser))

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockAchievements),
    } as Response)

    const { result } = renderHook(() => useViewerHub())

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.channelInfoById).toEqual({})
  })

  it('maps a 400 error to the invalid request message', async () => {
    localStorage.setItem('twitch_user', JSON.stringify(authUser))
    vi.mocked(fetch).mockImplementation(() => makeErrorResponse(400))

    const { result } = renderHook(() => useViewerHub())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.errorMessage).toBe('La requête du hub viewer est invalide.')
  })

  it('maps a 400 error to the invalid request message in English', async () => {
    localStorage.setItem('stream-quest_language', 'en')
    localStorage.setItem('twitch_user', JSON.stringify(authUser))
    vi.mocked(fetch).mockImplementation(() => makeErrorResponse(400))

    const { result } = renderHook(() => useViewerHub())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.errorMessage).toBe('The viewer hub request is invalid.')
  })

  it('maps a 404 error to the not found message', async () => {
    localStorage.setItem('twitch_user', JSON.stringify(authUser))
    vi.mocked(fetch).mockImplementation(() => makeErrorResponse(404))

    const { result } = renderHook(() => useViewerHub())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.errorMessage).toBe('Aucun succès n’a été trouvé pour ce compte.')
  })

  it('maps a 502 error to the upstream message', async () => {
    localStorage.setItem('twitch_user', JSON.stringify(authUser))
    vi.mocked(fetch).mockImplementation(() => makeErrorResponse(502))

    const { result } = renderHook(() => useViewerHub())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.errorMessage).toBe('Le service de succès est actuellement indisponible.')
  })

  it('falls back to a generic message for unknown errors', async () => {
    localStorage.setItem('twitch_user', JSON.stringify(authUser))
    vi.mocked(fetch).mockImplementation(() => makeErrorResponse(503))

    const { result } = renderHook(() => useViewerHub())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.errorMessage).toBe('Impossible de charger le hub viewer.')
  })

  it('falls back to a generic message when fetch rejects', async () => {
    localStorage.setItem('twitch_user', JSON.stringify(authUser))
    vi.mocked(fetch).mockRejectedValue(new Error('network down'))

    const { result } = renderHook(() => useViewerHub())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.errorMessage).toBe('Impossible de charger le hub viewer.')
  })

  it('should not update state when unmounted before fetch resolves', async () => {
    localStorage.setItem('twitch_user', JSON.stringify(authUser))

    let resolver!: (value: Response) => void
    vi.stubGlobal('fetch', vi.fn(() => new Promise<Response>(r => { resolver = r })))

    const { unmount } = renderHook(() => useViewerHub())

    unmount()

    await act(async () => {
      resolver({ ok: true, status: 200, json: () => Promise.resolve([]) } as Response)
    })
  })

  it('should not update state when unmounted before fetch rejects', async () => {
    localStorage.setItem('twitch_user', JSON.stringify(authUser))

    let rejecter!: (err: Error) => void
    vi.stubGlobal('fetch', vi.fn(() => new Promise<Response>((_, r) => { rejecter = r })))

    const { unmount } = renderHook(() => useViewerHub())

    unmount()

    await act(async () => {
      rejecter(new Error('Network failure'))
    })
  })
})

describe('fetchChannelInfosForIds', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    localStorage.clear()
  })

  it('returns {} when channelIds is empty', async () => {
    const result = await fetchChannelInfosForIds([])
    expect(result).toEqual({})
    expect(fetch).not.toHaveBeenCalled()
  })

  it('returns {} when twitch_tokens are not in localStorage', async () => {
    const result = await fetchChannelInfosForIds(['chan-1'])
    expect(result).toEqual({})
    expect(fetch).not.toHaveBeenCalled()
  })

  it('returns {} when twitch_tokens JSON is malformed', async () => {
    localStorage.setItem('twitch_tokens', 'not-json')
    const result = await fetchChannelInfosForIds(['chan-1'])
    expect(result).toEqual({})
    expect(fetch).not.toHaveBeenCalled()
  })

  it('returns {} when the Helix response is not ok', async () => {
    localStorage.setItem('twitch_tokens', JSON.stringify({ accessToken: 'tok' }))
    vi.mocked(fetch).mockResolvedValue({ ok: false, status: 401 } as Response)

    const result = await fetchChannelInfosForIds(['chan-1'])
    expect(result).toEqual({})
  })

  it('maps Helix response to channelInfo by id', async () => {
    localStorage.setItem('twitch_tokens', JSON.stringify({ accessToken: 'tok' }))
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          data: [
            { id: 'chan-1', display_name: 'ChanOne', profile_image_url: 'https://img/1.png' },
            { id: 'chan-2', display_name: 'ChanTwo', profile_image_url: 'https://img/2.png' },
          ],
        }),
    } as Response)

    const result = await fetchChannelInfosForIds(['chan-1', 'chan-2'])

    expect(result).toEqual({
      'chan-1': { name: 'ChanOne', avatarUrl: 'https://img/1.png' },
      'chan-2': { name: 'ChanTwo', avatarUrl: 'https://img/2.png' },
    })
  })
})
