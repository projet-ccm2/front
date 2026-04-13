import { describe, it, expect, vi } from 'vitest'
import { render, screen, act } from './utils/test-utils'
import { render as rawRender } from '@testing-library/react'
import { ChannelProvider, useChannel } from '../context/ChannelContext'
import React from 'react'

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
