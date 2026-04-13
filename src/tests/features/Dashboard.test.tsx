import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '../utils/test-utils'
import { Dashboard } from '../../features/dashboard/Dashboard'
import React from 'react'

// Mock Recharts to avoid heavy rendering
vi.mock('recharts', () => {
  return {
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="recharts-responsive">{children}</div>
    ),
    AreaChart: () => <div data-testid="recharts-area" />,
    LineChart: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="recharts-line">{children}</div>
    ),
    Area: () => <div />,
    Line: () => <div />,
    XAxis: () => <div />,
    YAxis: () => <div />,
    CartesianGrid: () => <div />,
    Tooltip: () => <div />,
  }
})

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

const mockChannelAchievements = [
  {
    id: 'achievement-1',
    title: 'First Steps',
    description: 'Send your first message',
    goal: 1,
    reward: 50,
    label: '',
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
  },
  {
    id: 'achievement-2',
    title: 'Chat Master',
    description: 'Send 100 messages',
    goal: 100,
    reward: 250,
    label: '',
    public: false,
    downloads: 0,
    visits: 0,
    active: false,
    secret: false,
    image: null,
    channelId: 'channel-1',
    type: {
      label: 'message',
      data: null,
    },
  },
]

const mockUserAchievements = [
  {
    ...mockChannelAchievements[0],
    userState: {
      progressCount: 1,
      finished: true,
      acquiredDate: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    },
  },
  {
    ...mockChannelAchievements[1],
    userState: {
      progressCount: 35,
      finished: false,
      acquiredDate: null,
    },
  },
]

describe('Dashboard', () => {
  const mockOnOpenSidebar = vi.fn()
  const mockFetch = vi.fn((input: RequestInfo | URL) => {
    const url = String(input)

    if (url.includes('/achievements/channel/channel-1')) {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockChannelAchievements),
      })
    }

    if (url.includes('/achievements/user/user-1/channel/channel-1')) {
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

  beforeEach(() => {
    localStorage.setItem('twitch_user', JSON.stringify(authUser))
    vi.stubGlobal('fetch', mockFetch)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    localStorage.clear()
  })

  it('should render dashboard title', async () => {
    render(<Dashboard onNavigate={() => {}} onOpenSidebar={mockOnOpenSidebar} />)

    expect(screen.getByText('Loading dashboard achievements...')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument()
    })
  })

  it('should render real achievement statistics after loading', async () => {
    render(<Dashboard onNavigate={() => {}} onOpenSidebar={mockOnOpenSidebar} />)

    expect(await screen.findByText('Active Achievements')).toBeInTheDocument()
    expect(screen.getByText('Public Templates')).toBeInTheDocument()
    expect(screen.getByText('Completed Achievements')).toBeInTheDocument()
    expect(screen.getByText('Achievement XP')).toBeInTheDocument()

    expect(screen.getByText('2 total')).toBeInTheDocument()
    expect(screen.getByText('channel-ready')).toBeInTheDocument()
    expect(screen.getByText('your progress')).toBeInTheDocument()
    expect(screen.getByText('earned')).toBeInTheDocument()
    expect(screen.getAllByText('1').length).toBeGreaterThan(1)
    expect(screen.getByText('50')).toBeInTheDocument()
  })

  it('should render recent activity from completed achievements', async () => {
    render(<Dashboard onNavigate={() => {}} onOpenSidebar={mockOnOpenSidebar} />)

    expect(await screen.findByText('Recent Activity')).toBeInTheDocument()
    expect(screen.getByText('You')).toBeInTheDocument()
    expect(screen.getByText('First Steps')).toBeInTheDocument()
  })

  it('should navigate to creator page', async () => {
    const mockNavigate = vi.fn()
    render(<Dashboard onNavigate={mockNavigate} onOpenSidebar={mockOnOpenSidebar} />)

    await screen.findByText('Create Achievement')

    const createBtns = screen.getAllByText('Create Achievement')
    const createBtn = createBtns.find(element => element.closest('button'))

    if (createBtn) {
      fireEvent.click(createBtn)
      expect(mockNavigate).toHaveBeenCalledWith('creator')
    }
  })

  it('should toggle sidebar on mobile', async () => {
    const mockOnNavigate = vi.fn()
    render(<Dashboard onNavigate={mockOnNavigate} onOpenSidebar={mockOnOpenSidebar} />)

    await screen.findByText('Active Achievements')

    const menuBtn = screen.getByTestId('mobile-menu-btn')
    fireEvent.click(menuBtn)
    expect(mockOnOpenSidebar).toHaveBeenCalled()
  })

  it('should handle quick actions', async () => {
    const mockOnNavigate = vi.fn()
    render(<Dashboard onNavigate={mockOnNavigate} onOpenSidebar={mockOnOpenSidebar} />)

    await screen.findByText('Active Achievements')

    const createBtn = screen.getByTestId('quick-create-btn')
    fireEvent.click(createBtn)
    expect(mockOnNavigate).toHaveBeenCalledWith('creator')

    const manageBtn = screen.getByTestId('quick-manage-btn')
    fireEvent.click(manageBtn)
    expect(mockOnNavigate).toHaveBeenCalledWith('management')
  })

  it('should navigate to marketplace', async () => {
    const mockOnNavigate = vi.fn()
    render(<Dashboard onNavigate={mockOnNavigate} onOpenSidebar={mockOnOpenSidebar} />)

    await screen.findByText('Active Achievements')

    const marketplaceBtn = screen.getByTestId('quick-marketplace-btn')
    fireEvent.click(marketplaceBtn)
    expect(mockOnNavigate).toHaveBeenCalledWith('marketplace')
  })

  it('should render an error state when dashboard requests fail', async () => {
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

    render(<Dashboard onNavigate={() => {}} onOpenSidebar={mockOnOpenSidebar} />)

    expect(
      await screen.findByText('The achievement service is currently unavailable.')
    ).toBeInTheDocument()
  })
})
