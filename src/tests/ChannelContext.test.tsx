import { describe, it, expect, vi } from 'vitest'
import { render, screen, act } from './utils/test-utils'
import { render as rawRender } from '@testing-library/react'
import { ChannelProvider, useChannel } from '../context/ChannelContext'
import React from 'react'

function ChannelProbe() {
  const { selectedChannel, availableChannels } = useChannel()

  return (
    <div>
      <div data-testid="selected-channel">{selectedChannel ? selectedChannel.name : 'none'}</div>
      <div data-testid="available-count">{availableChannels.length}</div>
      <div data-testid="available-names">
        {availableChannels.map(channel => channel.name).join(',')}
      </div>
    </div>
  )
}

class TestErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: string | null }
> {
  state = { error: null }

  static getDerivedStateFromError(error: Error) {
    return { error: error.message }
  }

  render() {
    if (this.state.error) {
      return <div>{this.state.error}</div>
    }

    return this.props.children
  }
}

describe('ChannelContext', () => {
  beforeEach(() => {
    localStorage.clear()
    const mockUser = {
      userId: '123456',
      username: 'testuser',
      channel: {
        id: '123',
        name: 'MyTwitchChannel',
        description: 'Test channel',
        profileImageUrl: 'http://example.com/image.png',
      },
      channelsWhichIsMod: ['ProGamingHub'],
    }
    localStorage.setItem('twitch_user', JSON.stringify(mockUser))
  })

  it('should render children', () => {
    render(
      <ChannelProvider>
        <div>Test Child</div>
      </ChannelProvider>
    )
    expect(screen.getByText('Test Child')).toBeInTheDocument()
  })

  it('should provide default channel', () => {
    const TestComponent = () => {
      const { selectedChannel } = useChannel()
      return <div>Selected: {selectedChannel.name}</div>
    }
    render(
      <ChannelProvider>
        <TestComponent />
      </ChannelProvider>
    )
    expect(screen.getByText('Selected: MyTwitchChannel')).toBeInTheDocument()
  })

  it('should expose no channels when there is no authenticated user', () => {
    localStorage.removeItem('twitch_user')

    render(
      <ChannelProvider>
        <ChannelProbe />
      </ChannelProvider>
    )

    expect(screen.getByTestId('selected-channel')).toHaveTextContent('none')
    expect(screen.getByTestId('available-count')).toHaveTextContent('0')
  })

  it('should keep moderator channels unresolved when the Twitch token is malformed', () => {
    localStorage.setItem('twitch_tokens', '{invalid-json')
    vi.stubGlobal('fetch', vi.fn())

    render(
      <ChannelProvider>
        <ChannelProbe />
      </ChannelProvider>
    )

    expect(screen.getByTestId('selected-channel')).toHaveTextContent('MyTwitchChannel')
    expect(screen.getByTestId('available-count')).toHaveTextContent('2')
    expect(screen.getByTestId('available-names')).toHaveTextContent('MyTwitchChannel,ProGamingHub')
    expect(fetch).not.toHaveBeenCalled()

    vi.unstubAllGlobals()
  })

  it('should keep moderator channels when the auth service rejects the request', async () => {
    localStorage.setItem('twitch_tokens', JSON.stringify({ accessToken: 'access-token' }))
    vi.stubGlobal(
      'fetch',
      vi.fn((input: RequestInfo | URL) => {
        const url = String(input)

        if (url.includes('/channels/me/moderated')) {
          return Promise.resolve({
            ok: false,
            status: 500,
            json: () => Promise.resolve({}),
            text: () => Promise.resolve('boom'),
          })
        }

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

    render(
      <ChannelProvider>
        <ChannelProbe />
      </ChannelProvider>
    )

    await act(async () => {
      await Promise.resolve()
    })

    expect(screen.getByTestId('selected-channel')).toHaveTextContent('MyTwitchChannel')
    expect(screen.getByTestId('available-count')).toHaveTextContent('2')
    expect(screen.getByTestId('available-names')).toHaveTextContent('MyTwitchChannel,ProGamingHub')

    vi.unstubAllGlobals()
  })

  it('should keep moderator channels when the auth service throws', async () => {
    localStorage.setItem('twitch_tokens', JSON.stringify({ accessToken: 'access-token' }))
    vi.stubGlobal(
      'fetch',
      vi.fn((input: RequestInfo | URL) => {
        const url = String(input)

        if (url.includes('/channels/me/moderated')) {
          throw new Error('network down')
        }

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

    render(
      <ChannelProvider>
        <ChannelProbe />
      </ChannelProvider>
    )

    await act(async () => {
      await Promise.resolve()
    })

    expect(screen.getByTestId('selected-channel')).toHaveTextContent('MyTwitchChannel')
    expect(screen.getByTestId('available-count')).toHaveTextContent('2')
    expect(screen.getByTestId('available-names')).toHaveTextContent('MyTwitchChannel,ProGamingHub')

    vi.unstubAllGlobals()
  })

  it('should allow updating selected channel', async () => {
    const TestComponent = () => {
      const { selectedChannel, setSelectedChannel, availableChannels } = useChannel()
      return (
        <div>
          <div>Selected: {selectedChannel.name}</div>
          <button onClick={() => setSelectedChannel(availableChannels[1])}>Switch Channel</button>
        </div>
      )
    }
    render(
      <ChannelProvider>
        <TestComponent />
      </ChannelProvider>
    )

    expect(screen.getByText('Selected: MyTwitchChannel')).toBeInTheDocument()

    await act(async () => {
      await screen.getByRole('button').click()
    })

    expect(screen.getByText('Selected: ProGamingHub')).toBeInTheDocument()
  })

  it('should throw error when useChannel is used outside provider', () => {
    const consoleSpy = vi.spyOn(console, 'error')
    consoleSpy.mockImplementation(() => {})

    const TestComponent = () => {
      useChannel()
      return <div>Should not render</div>
    }

    rawRender(
      <TestErrorBoundary>
        <TestComponent />
      </TestErrorBoundary>
    )

    expect(screen.getByText('useChannel must be used within a ChannelProvider')).toBeInTheDocument()

    consoleSpy.mockRestore()
  })
})
