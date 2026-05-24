import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  discordWebhookClient,
  DiscordWebhookError,
} from '../../../features/discord/api/discordWebhookClient'

const GCP_TOKEN = 'gcp-identity-token'

function mockMetadataOk() {
  return {
    ok: true,
    text: () => Promise.resolve(GCP_TOKEN),
  } as unknown as Response
}

describe('discordWebhookClient', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('should resolve without throwing on a successful response', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(mockMetadataOk())
      .mockResolvedValueOnce({ ok: true, status: 200 } as Response)

    await expect(
      discordWebhookClient.register('channel-1', 'https://discord.com/api/webhooks/test')
    ).resolves.toBeUndefined()
  })

  it('should send the GCP identity token as Authorization header', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(mockMetadataOk())
      .mockResolvedValueOnce({ ok: true, status: 200 } as Response)

    await discordWebhookClient.register('channel-1', 'https://discord.com/api/webhooks/test')

    const [, apiCall] = vi.mocked(fetch).mock.calls
    const headers = apiCall[1]?.headers as Record<string, string>
    expect(headers['Authorization']).toBe(`Bearer ${GCP_TOKEN}`)
  })

  it('should fetch the metadata token with Metadata-Flavor: Google header', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(mockMetadataOk())
      .mockResolvedValueOnce({ ok: true, status: 200 } as Response)

    await discordWebhookClient.register('channel-1', 'https://discord.com/api/webhooks/test')

    const [metadataCall] = vi.mocked(fetch).mock.calls
    const headers = metadataCall[1]?.headers as Record<string, string>
    expect(headers['Metadata-Flavor']).toBe('Google')
    expect(String(metadataCall[0])).toContain('metadata.google.internal')
  })

  it('should throw when metadata fetch fails', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 503,
    } as Response)

    await expect(
      discordWebhookClient.register('channel-1', 'https://discord.com/api/webhooks/test')
    ).rejects.toThrow()
  })

  it('should throw DiscordWebhookError with json details on non-ok API response', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(mockMetadataOk())
      .mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: () => Promise.resolve({ message: 'Forbidden' }),
      } as Response)

    await discordWebhookClient
      .register('channel-1', 'https://discord.com/api/webhooks/test')
      .catch((err: DiscordWebhookError) => {
        expect(err).toBeInstanceOf(DiscordWebhookError)
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
        json: () => {
          throw new Error('invalid json')
        },
        text: () => Promise.resolve('Internal Server Error'),
      } as unknown as Response)

    await discordWebhookClient
      .register('channel-1', 'https://discord.com/api/webhooks/test')
      .catch((err: DiscordWebhookError) => {
        expect(err).toBeInstanceOf(DiscordWebhookError)
        expect(err.status).toBe(500)
        expect(err.details).toBe('Internal Server Error')
      })
  })
})
