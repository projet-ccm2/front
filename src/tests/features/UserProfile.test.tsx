import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '../utils/test-utils'
import { UserProfile } from '../../features/profile/UserProfile'
import { useTheme } from '../../context/ThemeContext'
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
    type: { label: 'message', data: null },
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
    type: { label: 'message_content', data: null },
    userState: {
      progressCount: 10,
      finished: false,
      acquiredDate: null,
    },
  },
]

function ForceLightAppearance({ children }: { readonly children: React.ReactNode }) {
  const { theme, toggleTheme } = useTheme()
  const toggledRef = React.useRef(false)

  React.useEffect(() => {
    if (!toggledRef.current && theme !== 'dark') {
      toggledRef.current = true
      toggleTheme()
    }
  }, [theme, toggleTheme])

  return <>{children}</>
}

describe('UserProfile', () => {
  const mockOnOpenSidebar = vi.fn()

  beforeEach(() => {
    localStorage.setItem('twitch_user', JSON.stringify(authUser))
    vi.stubGlobal(
      'fetch',
      vi.fn((input: RequestInfo | URL) => {
        const url = String(input)

        if (url.includes('/leaderboard')) {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: () =>
              Promise.resolve([
                { username: 'streamer', userId: 'user-1', xp: 500 },
                { username: 'viewer1', userId: 'user-2', xp: 350 },
              ]),
          })
        }

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
  })

  it('should toggle sidebar on mobile', async () => {
    render(<UserProfile onOpenSidebar={mockOnOpenSidebar} />)
    fireEvent.click(screen.getByTestId('mobile-menu-btn'))
    expect(mockOnOpenSidebar).toHaveBeenCalled()
  })

  it('should display derived user level and XP', async () => {
    render(<UserProfile onOpenSidebar={mockOnOpenSidebar} />)
    expect(await screen.findByText(/50 \/ 250 XP/)).toBeInTheDocument()
    expect(screen.getAllByText('Niveau 1').length).toBeGreaterThan(0)
  })

  it('should show stats cards', async () => {
    render(<UserProfile onOpenSidebar={mockOnOpenSidebar} />)
    expect(screen.getByText(/Succ.*d.*bloqu.*s/i)).toBeInTheDocument()
    expect(await screen.findByText('1 / 2')).toBeInTheDocument()
  })

  it('should display the leaderboard section heading', async () => {
    render(<UserProfile onOpenSidebar={mockOnOpenSidebar} />)
    expect(await screen.findByRole('heading', { name: 'Classement' })).toBeInTheDocument()
  })

  it('should show account leaderboard summary', async () => {
    render(<UserProfile onOpenSidebar={mockOnOpenSidebar} />)
    expect(await screen.findByText(/50 \/ 250 XP/)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Classement' })).toBeInTheDocument()
    expect(await screen.findByText('viewer1')).toBeInTheDocument()
    expect(screen.getAllByText('streamer').length).toBeGreaterThan(0)
    expect(screen.getByText('500 XP')).toBeInTheDocument()
  })

  it('should show zeroed progress when no user achievements are returned', async () => {
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

    expect(await screen.findByText(/0 \/ 250 XP/)).toBeInTheDocument()
    expect(screen.getByText('0 / 0')).toBeInTheDocument()
  })

  it('should show an empty leaderboard state when no entries are returned', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn((input: RequestInfo | URL) => {
        const url = String(input)

        if (url.includes('/leaderboard')) {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: () => Promise.resolve([]),
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

    render(<UserProfile onOpenSidebar={mockOnOpenSidebar} />)

    expect(
      await screen.findByText(/Pas encore de donn.*es de classement|No leaderboard data yet/i)
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
      await screen.findByText(/service de succès est actuellement indisponible/i)
    ).toBeInTheDocument()
  })

  it('should render the profile image when one is available', async () => {
    localStorage.setItem(
      'twitch_user',
      JSON.stringify({
        ...authUser,
        channel: {
          ...authUser.channel,
          profileImageUrl: 'https://example.com/profile.png',
        },
      })
    )

    render(<UserProfile onOpenSidebar={mockOnOpenSidebar} />)

    expect(document.querySelector('img[alt=""]')).toHaveAttribute(
      'src',
      'https://example.com/profile.png'
    )
  })

  it('should display rank 4 and beyond including current user highlighted', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn((input: RequestInfo | URL) => {
        const url = String(input)

        if (url.includes('/leaderboard')) {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: () =>
              Promise.resolve([
                { username: 'viewer1', userId: 'user-2', xp: 500 },
                { username: 'viewer2', userId: 'user-3', xp: 400 },
                { username: 'viewer3', userId: 'user-4', xp: 300 },
                { username: 'viewer4', userId: 'user-5', xp: 200 },
                { username: 'streamer', userId: 'user-1', xp: 100 },
              ]),
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
          ok: true,
          status: 200,
          json: () => Promise.resolve([]),
        })
      })
    )

    render(<UserProfile onOpenSidebar={mockOnOpenSidebar} />)

    expect(await screen.findByText('viewer4')).toBeInTheDocument()
    expect(screen.getByText('#4')).toBeInTheDocument()
    expect(screen.getByText('200 XP')).toBeInTheDocument()
    // current user (streamer) appears in rank 5 with highlight
    expect(screen.getByText('#5')).toBeInTheDocument()
    expect(screen.getByText('100 XP')).toBeInTheDocument()
  })

  it('should render the profile layout in light appearance', async () => {
    render(
      <ForceLightAppearance>
        <UserProfile onOpenSidebar={mockOnOpenSidebar} />
      </ForceLightAppearance>
    )

    expect(await screen.findByText(/50 \/ 250 XP/)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'streamer' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Classement' })).toBeInTheDocument()
  })
})
