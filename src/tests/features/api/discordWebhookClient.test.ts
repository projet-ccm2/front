import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  discordWebhookClient,
  DiscordWebhookError,
} from '../../../features/discord/api/discordWebhookClient'

describe('discordWebhookClient', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('should resolve without throwing on a successful response', async () => {
    vi.mocked(fetch).mockResolvedValue({ ok: true, status: 200 } as Response)

    await expect(
      discordWebhookClient.register('id-token', 'channel-1', 'https://discord.com/api/webhooks/test')
    ).resolves.toBeUndefined()
  })

  it('should send the idToken as Authorization Bearer header', async () => {
    vi.mocked(fetch).mockResolvedValue({ ok: true, status: 200 } as Response)

    await discordWebhookClient.register('id-token', 'channel-1', 'https://discord.com/api/webhooks/test')

    const [, init] = vi.mocked(fetch).mock.calls[0]
    expect((init?.headers as Record<string, string>)['Authorization']).toBe('Bearer id-token')
  })

  it('should throw DiscordWebhookError with json details on non-ok response', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 403,
      json: () => Promise.resolve({ message: 'Forbidden' }),
    } as Response)

    await discordWebhookClient
      .register('id-token', 'channel-1', 'https://discord.com/api/webhooks/test')
      .catch((err: DiscordWebhookError) => {
        expect(err).toBeInstanceOf(DiscordWebhookError)
        expect(err.status).toBe(403)
        expect(err.details).toEqual({ message: 'Forbidden' })
      })
  })

  it('should fall back to text() when json() throws on a non-ok response', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 500,
      json: () => {
        throw new Error('invalid json')
      },
      text: () => Promise.resolve('Internal Server Error'),
    } as unknown as Response)

    await discordWebhookClient
      .register('id-token', 'channel-1', 'https://discord.com/api/webhooks/test')
      .catch((err: DiscordWebhookError) => {
        expect(err).toBeInstanceOf(DiscordWebhookError)
        expect(err.status).toBe(500)
        expect(err.details).toBe('Internal Server Error')
      })
  })
})
