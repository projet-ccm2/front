import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '../utils/test-utils'
import { UserProfile } from '../../features/profile/UserProfile'
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

const mockUserAchievements = [
  {
    id: '1',
    title: 'First Steps',
    description: 'Watch your first stream',
    goal: 1,
    reward: 50,
    label: 'FS',
    public: true,
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
    userState: {
      progressCount: 1,
      finished: true,
      acquiredDate: null,
    },
  },
  {
    id: '2',
    title: 'Chat Master',
    description: 'Send 100 messages in chat',
    goal: 100,
    reward: 250,
    label: 'CM',
    public: false,
    downloads: 0,
    visits: 0,
    active: true,
    secret: false,
    image: null,
    channelId: 'channel-1',
    type: {
      label: 'message_content',
      data: null,
    },
    userState: {
      progressCount: 10,
      finished: false,
      acquiredDate: null,
    },
  },
]

describe('UserProfile', () => {
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
            json: () => Promise.resolve(mockUserAchievements),
          })
        }

        if (url.includes('/achievements/user/user-1')) {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: () => Promise.resolve(mockUserAchievements),
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

  it('should render user profile with username', async () => {
    render(<UserProfile onOpenSidebar={mockOnOpenSidebar} />)
    expect(screen.getByRole('heading', { name: 'streamer' })).toBeInTheDocument()
    expect((await screen.findAllByText('First Steps')).length).toBeGreaterThan(0)
  })

  it('should toggle sidebar on mobile', async () => {
    render(<UserProfile onOpenSidebar={mockOnOpenSidebar} />)
    await screen.findAllByText('First Steps')
    const menuBtn = screen.getByTestId('mobile-menu-btn')
    fireEvent.click(menuBtn)
    expect(mockOnOpenSidebar).toHaveBeenCalled()
  })

  it('should display derived user level and XP', async () => {
    render(<UserProfile onOpenSidebar={mockOnOpenSidebar} />)
    expect(await screen.findByText(/50 \/ 250 XP/)).toBeInTheDocument()
    expect(screen.getAllByText('Niveau 1').length).toBeGreaterThan(0)
  })

  it('should show stats cards', async () => {
    render(<UserProfile onOpenSidebar={mockOnOpenSidebar} />)
    await screen.findAllByText('First Steps')
    expect(screen.getByText('Temps de visionnage total')).toBeInTheDocument()
    expect(screen.getByText('--')).toBeInTheDocument()
    expect(screen.getByText('Succès débloqués')).toBeInTheDocument()
    expect(screen.getByText('1 / 2')).toBeInTheDocument()
  })

  it('should display achievement badges', async () => {
    render(<UserProfile onOpenSidebar={mockOnOpenSidebar} />)
    expect(screen.getByRole('heading', { name: 'Badges de succès' })).toBeInTheDocument()
    expect((await screen.findAllByText('First Steps')).length).toBeGreaterThan(0)
    expect(screen.getAllByText('Chat Master').length).toBeGreaterThan(0)
  })

  it('should show leaderboard', async () => {
    render(<UserProfile onOpenSidebar={mockOnOpenSidebar} />)
    await screen.findAllByText('First Steps')
    expect(screen.getByRole('heading', { name: 'Classement' })).toBeInTheDocument()
    expect(
      screen.getByText(
        'Les meilleurs succès classés à partir des données renvoyées par achievement-management.'
      )
    ).toBeInTheDocument()
    expect(screen.getAllByText('Chat Master').length).toBeGreaterThan(0)
    expect(screen.getAllByText('First Steps').length).toBeGreaterThan(0)
    expect(screen.getByText('250 XP')).toBeInTheDocument()
  })

  it('should render profile image and leaderboard fallback avatars', async () => {
    const richAchievements = [
      {
        id: '1',
        title: 'Top Streamer',
        description: 'High value reward',
        goal: 1,
        reward: 250,
        label: 'TS',
        public: true,
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
        userState: {
          progressCount: 1,
          finished: true,
          acquiredDate: null,
        },
      },
      {
        id: '2',
        title: 'Bravo',
        description: 'Blank label uses title fallback',
        goal: 10,
        reward: 100,
        label: '   ',
        public: true,
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
        userState: {
          progressCount: 10,
          finished: true,
          acquiredDate: null,
        },
      },
      {
        id: '3',
        title: 'Alpha',
        description: 'Tie breaker entry',
        goal: 20,
        reward: 100,
        label: 'A',
        public: true,
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
        userState: {
          progressCount: 5,
          finished: false,
          acquiredDate: null,
        },
      },
      {
        id: '4',
        title: 'Charlie',
        description: 'Same progress for title comparison',
        goal: 20,
        reward: 100,
        label: 'C',
        public: true,
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
        userState: {
          progressCount: 5,
          finished: false,
          acquiredDate: null,
        },
      },
      {
        id: '5',
        title: 'Delta',
        description: 'Lower progress branch',
        goal: 20,
        reward: 100,
        label: 'D',
        public: true,
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
        userState: {
          progressCount: 2,
          finished: false,
          acquiredDate: null,
        },
      },
    ]

    localStorage.setItem(
      'twitch_user',
      JSON.stringify({
        ...authUser,
        channel: {
          ...authUser.channel,
          profileImageUrl: 'https://example.com/avatar.png',
        },
      })
    )
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve(richAchievements),
        })
      )
    )

    render(<UserProfile onOpenSidebar={mockOnOpenSidebar} />)

    await screen.findAllByText('Bravo')
    await screen.findAllByText('Charlie')
    await screen.findAllByText('Delta')

    const profileImage = document.querySelector('img')
    expect(profileImage).not.toBeNull()
    expect(profileImage).toHaveAttribute('src', 'https://example.com/avatar.png')
    expect(screen.getByRole('heading', { name: 'Classement' })).toBeInTheDocument()
    expect(screen.getAllByText('Bravo').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Charlie').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Delta').length).toBeGreaterThan(0)
    expect(screen.getAllByText('B').length).toBeGreaterThan(0)
  })

  it('should show an empty state when no user achievements are returned', async () => {
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

    render(<UserProfile onOpenSidebar={mockOnOpenSidebar} />)

    expect(
      await screen.findByText('Aucun succès de profil trouvé pour le moment.')
    ).toBeInTheDocument()
  })

  it('should show an error state when the backend fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 502,
          json: () => Promise.resolve({ message: 'bad gateway' }),
          text: () => Promise.resolve('bad gateway'),
        })
      )
    )

    render(<UserProfile onOpenSidebar={mockOnOpenSidebar} />)

    expect(
      await screen.findByText('Le service de succès est actuellement indisponible.')
    ).toBeInTheDocument()
  })
})
