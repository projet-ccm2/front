import React from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '../utils/test-utils'
import { waitFor } from '../utils/test-utils'
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

const mockViewerAchievementsDetailed = [
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
  {
    id: 'ach-3',
    title: 'Silent Start',
    description: 'No progress yet',
    goal: 10,
    reward: 120,
    label: '',
    public: true,
    downloads: 0,
    visits: 0,
    active: true,
    secret: false,
    image: null,
    channelId: 'channel-2',
    type: { label: 'message', data: null },
    userState: { progressCount: 0, finished: false, acquiredDate: null },
  },
  {
    id: 'ach-4',
    title: 'Mystery Path',
    description: 'Unknown channel bucket',
    goal: 3,
    reward: 30,
    label: '',
    public: true,
    downloads: 0,
    visits: 0,
    active: true,
    secret: false,
    image: null,
    channelId: undefined,
    type: { label: 'message', data: null },
    userState: { progressCount: 0, finished: false, acquiredDate: null },
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

  it('renders the overview, drills into a channel and switches tabs', async () => {
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
            json: () => Promise.resolve(mockViewerAchievementsDetailed),
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
    expect(screen.getAllByText('channel-2').length).toBeGreaterThan(0)
    expect(screen.getAllByAltText('MyChannel').length).toBeGreaterThan(0)

    const channelButtons = screen.getAllByRole('button', { name: /channel-2/i })
    fireEvent.click(channelButtons[0])

    expect(screen.getByText('Chaîne channel-2')).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getByText('Succès caché')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: /Débloqués|Unlocked/i }))
    expect(
      screen.getByText(/Aucun succès dans cette catégorie|No achievements in this category/i)
    ).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /En cours|In progress/i }))
    expect(screen.getByText('Succès caché')).toBeInTheDocument()

    fireEvent.click(screen.getByTestId('mobile-menu-btn'))
    expect(onOpenSidebar).toHaveBeenCalled()
  })
})
