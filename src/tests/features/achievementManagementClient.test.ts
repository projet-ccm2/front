import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  achievementManagementClient,
  AchievementManagementError,
} from '../../features/achievements/api/achievementManagementClient'

const mockAchievement = {
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
    label: 'message' as const,
    data: null,
  },
}

const mockBadge = {
  id: 'badge-1',
  title: 'Badge Title',
  image: 'https://example.com/badge.png',
}

describe('achievementManagementClient', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('should fetch public achievements', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve([mockAchievement]),
    } as Response)

    const result = await achievementManagementClient.getPublicAchievements()

    expect(result).toEqual([mockAchievement])
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/achievements/public'),
      expect.objectContaining({
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
      })
    )
  })

  it('should post create payloads to the achievement service', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockAchievement),
    } as Response)

    await achievementManagementClient.createAchievement({
      title: 'First Steps',
      description: 'Send your first message',
      goal: 1,
      reward: 50,
      label: '',
      public: false,
      active: true,
      secret: false,
      image: null,
      channelId: 'channel-1',
      type: {
        label: 'message',
        data: null,
      },
    })

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/achievements'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          title: 'First Steps',
          description: 'Send your first message',
          goal: 1,
          reward: 50,
          label: '',
          public: false,
          active: true,
          secret: false,
          image: null,
          channelId: 'channel-1',
          type: {
            label: 'message',
            data: null,
          },
        }),
      })
    )
  })

  it('should fetch user badges', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve([mockBadge]),
    } as Response)

    const result = await achievementManagementClient.getUserBadges('user-1')

    expect(result).toEqual([mockBadge])
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/badges/user/user-1'),
      expect.objectContaining({
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
      })
    )
  })

  it('should fetch channel badge', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockBadge),
    } as Response)

    const result = await achievementManagementClient.getChannelBadge('channel-1')

    expect(result).toEqual(mockBadge)
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/badges/channel/channel-1'),
      expect.objectContaining({
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
      })
    )
  })

  it('should send badge update payloads with image uploads', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockBadge),
    } as Response)

    await achievementManagementClient.updateChannelBadge('channel-1', {
      title: 'Updated Badge Title',
      imageUpload: {
        fileName: 'badge.png',
        mimeType: 'image/png',
        contentBase64: 'data:image/png;base64,abc',
      },
    })

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/badges/channel/channel-1'),
      expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify({
          title: 'Updated Badge Title',
          imageUpload: {
            fileName: 'badge.png',
            mimeType: 'image/png',
            contentBase64: 'data:image/png;base64,abc',
          },
        }),
      })
    )
  })

  it('should send badge update payloads with only the current image', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockBadge),
    } as Response)

    await achievementManagementClient.updateChannelBadge('channel-1', {
      image: 'https://example.com/badge.png',
    })

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/badges/channel/channel-1'),
      expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify({
          image: 'https://example.com/badge.png',
        }),
      })
    )
  })

  it('should send badge update payloads with only an image upload', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockBadge),
    } as Response)

    await achievementManagementClient.updateChannelBadge('channel-1', {
      imageUpload: {
        fileName: 'badge.png',
        mimeType: 'image/png',
        contentBase64: 'data:image/png;base64,abc',
      },
    })

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/badges/channel/channel-1'),
      expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify({
          imageUpload: {
            fileName: 'badge.png',
            mimeType: 'image/png',
            contentBase64: 'data:image/png;base64,abc',
          },
        }),
      })
    )
  })

  it('should send badge update payloads with only a title', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockBadge),
    } as Response)

    await achievementManagementClient.updateChannelBadge('channel-1', {
      title: 'Updated Badge Title',
    })

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/badges/channel/channel-1'),
      expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify({
          title: 'Updated Badge Title',
        }),
      })
    )
  })

  it('should return undefined for delete responses with status 204', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 204,
    } as Response)

    const result = await achievementManagementClient.deleteAchievement('achievement-1')

    expect(result).toBeUndefined()
  })

  it('should surface json error details in AchievementManagementError', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 502,
      json: () => Promise.resolve({ message: 'bad gateway' }),
    } as Response)

    await expect(achievementManagementClient.getPublicAchievements()).rejects.toMatchObject({
      name: 'AchievementManagementError',
      status: 502,
      details: { message: 'bad gateway' },
    } satisfies Partial<AchievementManagementError>)
  })

  it('should fall back to text error details when json parsing fails', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.reject(new Error('invalid json')),
      text: () => Promise.resolve('server exploded'),
    } as unknown as Response)

    await expect(achievementManagementClient.getAchievement('achievement-1')).rejects.toMatchObject(
      {
        name: 'AchievementManagementError',
        status: 500,
        details: 'server exploded',
      } satisfies Partial<AchievementManagementError>
    )
  })
})
