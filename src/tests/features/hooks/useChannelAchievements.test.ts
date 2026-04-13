import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '../../utils/test-utils'
import { useChannelAchievements } from '../../../features/achievements/hooks/useChannelAchievements'

const mockAchievements = [
  {
    id: 'achievement-1',
    title: 'First Steps',
    description: 'Send your first message',
    goal: 1,
    reward: 50,
    label: '',
    public: false,
    downloads: 0,
    visits: 0,
    active: true,
    secret: false,
    image: null,
    channelId: 'channel-1',
    type: {
      label: 'message',
      data: null,
    },
  },
]

describe('useChannelAchievements', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('should require a selected channel before loading achievements', async () => {
    const { result } = renderHook(() => useChannelAchievements(null))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.achievements).toEqual([])
    expect(result.current.errorMessage).toBe('Select a channel to load achievements.')
    expect(fetch).not.toHaveBeenCalled()
  })

  it('should block synthetic moderator channel ids before issuing a request', async () => {
    const { result } = renderHook(() => useChannelAchievements('mod-0'))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.achievements).toEqual([])
    expect(result.current.errorMessage).toBe(
      'Achievement management currently supports only the connected user channel. Moderator channels are not handled yet.'
    )
    expect(fetch).not.toHaveBeenCalled()
  })

  it('should load channel achievements when the channel id is valid', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockAchievements),
    } as Response)

    const { result } = renderHook(() => useChannelAchievements('channel-1'))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.achievements).toEqual(mockAchievements)
    expect(result.current.errorMessage).toBeNull()
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/achievements/channel/channel-1'),
      expect.any(Object)
    )
  })

  it('should expose a channel-specific not found error', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 404,
      json: () => Promise.resolve({ message: 'not found' }),
      text: () => Promise.resolve('not found'),
    } as Response)

    const { result } = renderHook(() => useChannelAchievements('channel-1'))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.achievements).toEqual([])
    expect(result.current.errorMessage).toBe('No achievements were found for this channel.')
  })
})
