import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '../utils/test-utils'
import { TwitchOverlay } from '../../features/overlay/TwitchOverlay'
import React from 'react'

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

const mockAchievements = [
  {
    id: 'ach-1',
    title: 'Chat Master',
    description: 'Send 100 messages',
    goal: 100,
    reward: 250,
    label: 'CM',
    public: true,
    downloads: 0,
    visits: 0,
    active: true,
    secret: false,
    image: null,
    channelId: 'channel-1',
    type: { label: 'message', data: null },
    userState: { progressCount: 75, finished: false, acquiredDate: null },
  },
  {
    id: 'ach-2',
    title: 'Hidden Raid',
    description: 'Secret raid challenge',
    goal: 3,
    reward: 500,
    label: '',
    public: true,
    downloads: 0,
    visits: 0,
    active: true,
    secret: true,
    image: null,
    channelId: 'channel-1',
    type: { label: 'message_content', data: null },
    userState: { progressCount: 1, finished: false, acquiredDate: null },
  },
  {
    id: 'ach-3',
    title: 'Loyal Viewer',
    description: 'Watch 10 streams',
    goal: 10,
    reward: 100,
    label: 'LV',
    public: true,
    downloads: 0,
    visits: 0,
    active: true,
    secret: false,
    image: null,
    channelId: 'channel-1',
    type: { label: 'message', data: null },
    userState: { progressCount: 10, finished: true, acquiredDate: new Date().toISOString() },
  },
]

describe('TwitchOverlay', () => {
  const mockOnOpenSidebar = vi.fn()

  beforeEach(() => {
    localStorage.setItem('twitch_user', JSON.stringify(authUser))
    vi.stubGlobal(
      'fetch',
      vi.fn((input: RequestInfo | URL) => {
        const url = String(input)

        if (url.includes('/achievements/user/user-1/channel/channel-1')) {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: () => Promise.resolve(mockAchievements),
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
  })

  it('should render the viewer panel with dynamic achievement data', async () => {
    render(<TwitchOverlay onOpenSidebar={mockOnOpenSidebar} />)

    expect(screen.getByText('Panneau Twitch')).toBeInTheDocument()
    expect(await screen.findByText('Succès du viewer')).toBeInTheDocument()
    expect(screen.getByText('Classement')).toBeInTheDocument()
    expect(screen.getAllByText('Chat Master').length).toBeGreaterThan(1)
    expect(screen.getAllByText('Loyal Viewer').length).toBeGreaterThan(1)
    expect(screen.getByText('Succès caché')).toBeInTheDocument()
    expect(screen.getByText('?')).toBeInTheDocument()
    expect(screen.getByText('1 / 3')).toBeInTheDocument()
    expect(screen.getByText('3 au total')).toBeInTheDocument()
  })

  it('should toggle sidebar on mobile', () => {
    render(<TwitchOverlay onOpenSidebar={mockOnOpenSidebar} />)

    const menuBtn = screen.getByTestId('mobile-menu-btn')
    expect(menuBtn).toBeInTheDocument()
    fireEvent.click(menuBtn)
    expect(mockOnOpenSidebar).toHaveBeenCalled()
  })

  it('should render loading and empty states when the backend has no data', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve([]),
        })
      )
    )

    render(<TwitchOverlay onOpenSidebar={mockOnOpenSidebar} />)

    expect(
      await screen.findByText('Aucun succès disponible pour ce panneau pour le moment.')
    ).toBeInTheDocument()
  })
})
