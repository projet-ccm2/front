import React from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'

describe('ChannelContext moderator enrichment', () => {
  beforeEach(() => {
    vi.resetModules()
    ;(globalThis as typeof globalThis & { _env_?: { TWITCH_CLIENT_ID?: string } })._env_ = {
      TWITCH_CLIENT_ID: 'client-1',
    }

    localStorage.setItem(
      'twitch_user',
      JSON.stringify({
        userId: '123456',
        username: 'testuser',
        channel: {
          id: '123',
          name: 'MyTwitchChannel',
          description: 'Test channel',
          profileImageUrl: 'http://example.com/image.png',
        },
        channelsWhichIsMod: ['ProGamingHub'],
      })
    )

    // Minimal JWT with exp=9999999999 (year 2286) — passes isJwtExpired check
    localStorage.setItem('twitch_tokens', JSON.stringify({ accessToken: 'token-1', idToken: 'h.eyJleHAiOjk5OTk5OTk5OTl9.s' }))

    vi.stubGlobal(
      'fetch',
      vi.fn((input: RequestInfo | URL) => {
        const url = String(input)

        if (url.startsWith('https://api.twitch.tv/helix/users')) {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: () =>
              Promise.resolve({
                data: [
                  {
                    id: 'ProGamingHub',
                    display_name: 'Pro Gaming Hub',
                    profile_image_url: 'https://example.com/mod.png',
                  },
                ],
              }),
          })
        }

        return Promise.resolve({
          ok: false,
          status: 500,
          json: () => Promise.resolve({ message: `Unhandled request: ${url}` }),
          text: () => Promise.resolve(`Unhandled request: ${url}`),
        })
      })
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    localStorage.clear()
    delete (globalThis as typeof globalThis & { _env_?: { TWITCH_CLIENT_ID?: string } })._env_
  })

  it('should enrich moderator channels from the Twitch Helix API', async () => {
    const { AuthProvider } = await import('../context/AuthContext')
    const { ChannelProvider, useChannel } = await import('../context/ChannelContext')

    function Probe() {
      const { availableChannels, selectedChannel } = useChannel()
      return (
        <div>
          <div data-testid="selected">{selectedChannel?.name ?? 'none'}</div>
          <div data-testid="moderator">{availableChannels[1]?.name ?? 'missing'}</div>
          <img
            data-testid="moderator-avatar"
            src={availableChannels[1]?.avatar}
            alt="moderator avatar"
          />
        </div>
      )
    }

    render(
      <AuthProvider>
        <ChannelProvider>
          <Probe />
        </ChannelProvider>
      </AuthProvider>
    )

    expect(screen.getByTestId('selected')).toHaveTextContent('MyTwitchChannel')

    await waitFor(() => {
      expect(screen.getByTestId('moderator')).toHaveTextContent('Pro Gaming Hub')
      expect(screen.getByTestId('moderator-avatar')).toHaveAttribute(
        'src',
        'https://example.com/mod.png'
      )
    })
  })
})
