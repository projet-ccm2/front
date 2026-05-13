import React from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '../utils/test-utils'
import { ViewerHub } from '../../features/viewer/ViewerHub'

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

const mockViewerAchievements = [
  {
    id: 'ach-1',
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
    type: { label: 'message', data: null },
    userState: { progressCount: 1, finished: true, acquiredDate: new Date().toISOString() },
  },
  {
    id: 'ach-2',
    title: 'Hidden Road',
    description: 'Hidden challenge',
    goal: 5,
    reward: 250,
    label: '',
    public: true,
    downloads: 0,
    visits: 0,
    active: true,
    secret: true,
    image: null,
    channelId: 'channel-2',
    type: { label: 'message_content', data: null },
    userState: { progressCount: 2, finished: false, acquiredDate: null },
  },
]

describe('ViewerHub', () => {
  beforeEach(() => {
    localStorage.setItem('twitch_user', JSON.stringify(authUser))
    vi.stubGlobal(
      'fetch',
      vi.fn((input: RequestInfo | URL) => {
        const url = String(input)

        if (url.includes('/achievements/user/user-1')) {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: () => Promise.resolve(mockViewerAchievements),
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

  it('renders the viewer hub with grouped channels', async () => {
    render(<ViewerHub onOpenSidebar={vi.fn()} />)

    expect(await screen.findByRole('heading', { name: 'Hub viewer' })).toBeInTheDocument()
    expect(screen.getAllByText(/Cha.*nes suivies/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText('MyChannel').length).toBeGreaterThan(0)
    expect(screen.getAllByText('channel-2').length).toBeGreaterThan(0)
    expect(screen.getAllByText('First Steps').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Succès caché').length).toBeGreaterThan(0)
  })

  it('shows loading while the viewer achievements request is pending', () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(
        () =>
          new Promise<Response>(() => {
            // Keep the request pending so the loading branch stays visible.
          })
      )
    )

    render(<ViewerHub onOpenSidebar={vi.fn()} />)

    expect(
      screen.getByText(/Chargement des chaînes suivies|Loading viewer channels/i)
    ).toBeInTheDocument()
  })

  it('shows an error state when the viewer hub request fails', async () => {
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

    render(<ViewerHub onOpenSidebar={vi.fn()} />)

    expect(
      await screen.findByText(
        /Le service de succès est actuellement indisponible|The achievement service is currently unavailable/i
      )
    ).toBeInTheDocument()
  })

  it('shows an empty state when the viewer has no achievements', async () => {
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

    render(<ViewerHub onOpenSidebar={vi.fn()} />)

    expect(
      await screen.findByText(
        /Aucun succès actif trouvé pour ce compte|No active achievements found for this account yet/i
      )
    ).toBeInTheDocument()
  })

  it('renders the overview and opens the mobile menu', async () => {
    localStorage.setItem(
      'twitch_user',
      JSON.stringify({
        ...authUser,
        channel: {
          ...authUser.channel,
          profileImageUrl: 'https://example.com/channel-avatar.png',
        },
      })
    )

    vi.stubGlobal(
      'fetch',
      vi.fn((input: RequestInfo | URL) => {
        const url = String(input)

        if (url.includes('/achievements/user/user-1')) {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: () =>
              Promise.resolve([
                {
                  id: 'ach-1',
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
                  image: 'https://example.com/channel-avatar.png',
                  channelId: 'channel-1',
                  type: { label: 'message', data: null },
                  userState: {
                    progressCount: 1,
                    finished: true,
                    acquiredDate: new Date().toISOString(),
                  },
                },
              ]),
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

    const onOpenSidebar = vi.fn()
    render(<ViewerHub onOpenSidebar={onOpenSidebar} />)

    expect(await screen.findByRole('heading', { name: 'Hub viewer' })).toBeInTheDocument()
    expect(screen.getAllByText('MyChannel').length).toBeGreaterThan(0)
    expect(screen.getByTestId('mobile-menu-btn')).toBeInTheDocument()

    fireEvent.click(screen.getByTestId('mobile-menu-btn'))
    expect(onOpenSidebar).toHaveBeenCalled()
  })

  it('shows the channel detail view when a mobile channel tab is clicked (line 264)', async () => {
    render(<ViewerHub onOpenSidebar={vi.fn()} />)

    await screen.findByRole('heading', { name: 'Hub viewer' })

    // Mobile tab buttons appear after the desktop sidebar buttons in DOM order
    // channel-2 text: [0]=desktop sidebar, [1]=mobile tab, [2]=ChannelSummaryCard
    const channelButtons = await screen.findAllByText('channel-2')
    // Click the mobile tab (index 1) to fire line 264's onClick
    fireEvent.click(channelButtons[1])

    expect(await screen.findByRole('heading', { name: 'channel-2' })).toBeInTheDocument()
  })

  it('shows a back button in the channel detail view and returns to overview on click', async () => {
    render(<ViewerHub onOpenSidebar={vi.fn()} />)

    await screen.findByRole('heading', { name: 'Hub viewer' })

    // Navigate to channel-2 via desktop sidebar
    const channelButtons = await screen.findAllByText('channel-2')
    fireEvent.click(channelButtons[0])

    expect(await screen.findByRole('heading', { name: 'channel-2' })).toBeInTheDocument()

    // Back button should be present
    const backBtn = screen.getByTestId('back-btn')
    expect(backBtn).toBeInTheDocument()

    // Click back → returns to overview
    fireEvent.click(backBtn)

    expect(await screen.findByRole('heading', { name: 'Hub viewer' })).toBeInTheDocument()
    expect(screen.queryByTestId('back-btn')).not.toBeInTheDocument()
  })

  it('shows the channel detail view when a channel card is clicked (line 379)', async () => {
    render(<ViewerHub onOpenSidebar={vi.fn()} />)

    await screen.findByRole('heading', { name: 'Hub viewer' })

    // channel-2 text: [0]=desktop sidebar, [1]=mobile tab, [2]=ChannelSummaryCard in OverviewPanel
    const channelButtons = await screen.findAllByText('channel-2')
    // Click the ChannelSummaryCard (index 2) to fire line 379's onSelectChannel
    fireEvent.click(channelButtons[2])

    expect(await screen.findByRole('heading', { name: 'channel-2' })).toBeInTheDocument()
  })

  it('resolves channel name and avatar from ChannelContext for moderated channels', async () => {
    localStorage.setItem(
      'twitch_user',
      JSON.stringify({
        ...authUser,
        channelsWhichIsMod: ['channel-2'],
      })
    )

    render(<ViewerHub onOpenSidebar={vi.fn()} />)

    await screen.findByRole('heading', { name: 'Hub viewer' })

    // channel-2 is in channelsWhichIsMod so ChannelContext sets its name to 'channel-2'
    // (enrichment from Helix only happens when twitch_tokens are in localStorage)
    // The channel should still appear (name matches channelId before enrichment)
    expect(screen.getAllByText('channel-2').length).toBeGreaterThan(0)
  })

  it('navigates to channel detail and filters by completed (line 586)', async () => {
    render(<ViewerHub onOpenSidebar={vi.fn()} />)

    await screen.findByRole('heading', { name: 'Hub viewer' })

    // Navigate to channel-1 via mobile tab (index 1)
    const channelButtons = await screen.findAllByText('MyChannel')
    fireEvent.click(channelButtons[1])

    expect(await screen.findByRole('heading', { name: 'MyChannel' })).toBeInTheDocument()
    expect(screen.getByText('First Steps')).toBeInTheDocument()

    // Click the filter tab button specifically (line 586's setFilter callback)
    const filterTabButtons = screen.getAllByRole('button', { name: /Débloqués|Unlocked/i })
    fireEvent.click(filterTabButtons[0])

    // First Steps is completed — should still appear under completed filter
    expect(screen.getByText('First Steps')).toBeInTheDocument()
  })

  it('filters achievements by in-progress (line 40)', async () => {
    render(<ViewerHub onOpenSidebar={vi.fn()} />)

    await screen.findByRole('heading', { name: 'Hub viewer' })

    // Navigate to channel-2 which has an in-progress achievement
    const channelButtons = await screen.findAllByText('channel-2')
    fireEvent.click(channelButtons[1])

    expect(await screen.findByRole('heading', { name: 'channel-2' })).toBeInTheDocument()

    // Click "En cours" filter
    const inProgressButtons = screen.getAllByRole('button', { name: /En cours|In progress/i })
    fireEvent.click(inProgressButtons[0])

    // Secret in-progress achievement should be visible (masked as 'Succès caché')
    expect(screen.getAllByText(/Succ.*cach|Hidden/i).length).toBeGreaterThan(0)
  })

  it('navigates to channel detail via desktop sidebar button (line 192)', async () => {
    render(<ViewerHub onOpenSidebar={vi.fn()} />)

    await screen.findByRole('heading', { name: 'Hub viewer' })

    // Desktop sidebar channel button is index [0] (before mobile tab [1] and ChannelSummaryCard [2])
    const channelButtons = await screen.findAllByText('channel-2')
    fireEvent.click(channelButtons[0])

    expect(await screen.findByRole('heading', { name: 'channel-2' })).toBeInTheDocument()
  })

  it('returns to overview after navigating to a channel via mobile overview button (line 246)', async () => {
    render(<ViewerHub onOpenSidebar={vi.fn()} />)

    await screen.findByRole('heading', { name: 'Hub viewer' })

    // Navigate to MyChannel via mobile tab
    const channelButtons = await screen.findAllByText('MyChannel')
    fireEvent.click(channelButtons[1])

    expect(await screen.findByRole('heading', { name: 'MyChannel' })).toBeInTheDocument()

    // Click the mobile overview button (index [1] — desktop is [0])
    const overviewButtons = screen.getAllByRole('button', { name: /Vue d'ensemble|Overview/i })
    fireEvent.click(overviewButtons[1])

    expect(await screen.findByRole('heading', { name: 'Hub viewer' })).toBeInTheDocument()
  })

  it('covers achievements with no progress in the sort order', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn((input: RequestInfo | URL) => {
        const url = String(input)

        if (url.includes('/achievements/user/user-1')) {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: () =>
              Promise.resolve([
                {
                  id: 'ach-1',
                  title: 'First Steps',
                  description: 'Complete first message',
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
                  type: { label: 'message', data: null },
                  userState: { progressCount: 1, finished: true, acquiredDate: new Date().toISOString() },
                },
                {
                  id: 'ach-2',
                  title: 'Chat Active',
                  description: 'In progress achievement',
                  goal: 10,
                  reward: 100,
                  label: '',
                  public: true,
                  downloads: 0,
                  visits: 0,
                  active: true,
                  secret: false,
                  image: null,
                  channelId: 'channel-1',
                  type: { label: 'message', data: null },
                  userState: { progressCount: 3, finished: false, acquiredDate: null },
                },
                {
                  id: 'ach-3',
                  title: 'Not Started',
                  description: 'No progress yet',
                  goal: 5,
                  reward: 75,
                  label: '',
                  public: true,
                  downloads: 0,
                  visits: 0,
                  active: true,
                  secret: false,
                  image: null,
                  channelId: 'channel-1',
                  type: { label: 'message', data: null },
                  userState: { progressCount: 0, finished: false, acquiredDate: null },
                },
              ]),
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

    render(<ViewerHub onOpenSidebar={vi.fn()} />)

    // All 3 achievements should appear in sorted order
    expect(await screen.findByText('First Steps')).toBeInTheDocument()
    expect(screen.getByText('Chat Active')).toBeInTheDocument()
    expect(screen.getByText('Not Started')).toBeInTheDocument()
  })
})
