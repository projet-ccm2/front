import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '../../utils/test-utils'
import { useDiscordWebhook } from '../../../features/discord/hooks/useDiscordWebhook'
import { DiscordWebhookError } from '../../../features/discord/api/discordWebhookClient'

vi.mock('../../../features/discord/api/discordWebhookClient', async importOriginal => {
  const actual =
    await importOriginal<typeof import('../../../features/discord/api/discordWebhookClient')>()
  return {
    ...actual,
    discordWebhookClient: {
      register: vi.fn(),
    },
  }
})

const { discordWebhookClient } = await import('../../../features/discord/api/discordWebhookClient')

const authUser = {
  userId: 'user-1',
  username: 'streamer',
  channel: {
    id: 'channel-1',
    name: 'MyChannel',
    description: 'desc',
    profileImageUrl: '',
  },
  channelsWhichIsMod: [],
}

describe('useDiscordWebhook', () => {
  beforeEach(() => {
    localStorage.setItem('twitch_user', JSON.stringify(authUser))
    vi.clearAllMocks()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('should save a webhook URL successfully', async () => {
    vi.mocked(discordWebhookClient.register).mockResolvedValue(undefined)

    const { result } = renderHook(() => useDiscordWebhook())

    await act(async () => {
      await result.current.register('https://discord.com/api/webhooks/test')
    })

    expect(result.current.successKey).toBe('discord.webhook.saved')
    expect(result.current.errorKey).toBeNull()
    expect(result.current.isSaving).toBe(false)
  })

  it('should set successKey to removed when webhookUrl is null', async () => {
    vi.mocked(discordWebhookClient.register).mockResolvedValue(undefined)

    const { result } = renderHook(() => useDiscordWebhook())

    await act(async () => {
      await result.current.register(null)
    })

    expect(result.current.successKey).toBe('discord.webhook.removed')
    expect(result.current.errorKey).toBeNull()
  })

  it('should set error key for 403 Forbidden', async () => {
    vi.mocked(discordWebhookClient.register).mockRejectedValue(
      new DiscordWebhookError('Forbidden', 403)
    )

    const { result } = renderHook(() => useDiscordWebhook())

    await act(async () => {
      await result.current.register('https://discord.com/api/webhooks/test')
    })

    expect(result.current.errorKey).toBe('discord.webhook.error.forbidden')
    expect(result.current.successKey).toBeNull()
  })

  it('should set error key for 400 Bad Request', async () => {
    vi.mocked(discordWebhookClient.register).mockRejectedValue(
      new DiscordWebhookError('Bad Request', 400)
    )

    const { result } = renderHook(() => useDiscordWebhook())

    await act(async () => {
      await result.current.register('https://discord.com/api/webhooks/test')
    })

    expect(result.current.errorKey).toBe('discord.webhook.error.validation')
    expect(result.current.successKey).toBeNull()
  })

  it('should set error key for 401 Unauthorized', async () => {
    vi.mocked(discordWebhookClient.register).mockRejectedValue(
      new DiscordWebhookError('Unauthorized', 401)
    )

    const { result } = renderHook(() => useDiscordWebhook())

    await act(async () => {
      await result.current.register('https://discord.com/api/webhooks/test')
    })

    expect(result.current.errorKey).toBe('discord.webhook.error.auth')
    expect(result.current.successKey).toBeNull()
  })

  it('should set service error key for other DiscordWebhookError status codes', async () => {
    vi.mocked(discordWebhookClient.register).mockRejectedValue(
      new DiscordWebhookError('Server Error', 500)
    )

    const { result } = renderHook(() => useDiscordWebhook())

    await act(async () => {
      await result.current.register('https://discord.com/api/webhooks/test')
    })

    expect(result.current.errorKey).toBe('discord.webhook.error.service')
    expect(result.current.successKey).toBeNull()
  })

  it('should set service error key for non-DiscordWebhookError errors', async () => {
    vi.mocked(discordWebhookClient.register).mockRejectedValue(new Error('Network failure'))

    const { result } = renderHook(() => useDiscordWebhook())

    await act(async () => {
      await result.current.register('https://discord.com/api/webhooks/test')
    })

    expect(result.current.errorKey).toBe('discord.webhook.error.service')
    expect(result.current.successKey).toBeNull()
  })

})
