import { describe, it, expect, vi } from 'vitest'
import { render, screen, renderHook, act } from './utils/test-utils'
import { renderHook as rawRenderHook } from '@testing-library/react'
import { ChannelProvider, useChannel } from '../context/ChannelContext'
import React from 'react'

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

    expect(() => rawRenderHook(() => useChannel())).toThrow(
      'useChannel must be used within a ChannelProvider'
    )

    consoleSpy.mockRestore()
  })
})
