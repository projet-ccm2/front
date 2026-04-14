import React from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '../utils/test-utils'
import { PublicTwitchPanel } from '../../features/overlay/PublicTwitchPanel'

const mockAchievements = [
  {
    id: 'ach-1',
    title: 'Public Hero',
    description: 'Finish the public quest',
    goal: 10,
    reward: 100,
    label: 'PH',
    public: true,
    downloads: 12,
    visits: 27,
    active: true,
    secret: false,
    image: null,
    channelId: 'channel-1',
    type: { label: 'message', data: null },
  },
  {
    id: 'ach-2',
    title: 'Secret Goal',
    description: 'Hidden until unlocked',
    goal: 3,
    reward: 250,
    label: '',
    public: true,
    downloads: 4,
    visits: 8,
    active: false,
    secret: true,
    image: null,
    channelId: 'channel-1',
    type: { label: 'watch_time', data: null },
  },
]

const mockViewerAchievements = [
  {
    id: 'viewer-ach-1',
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
    userState: {
      progressCount: 25,
      finished: false,
      acquiredDate: null,
    },
  },
]

describe('PublicTwitchPanel', () => {
  const mockOnOpenSidebar = vi.fn()

  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('renders the public URL and opens the sidebar when provided', async () => {
    Object.defineProperty(window.navigator, 'clipboard', {
      value: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
      configurable: true,
    })
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve(mockAchievements),
        })
      )
    )

    render(<PublicTwitchPanel channelId="channel-1" onOpenSidebar={mockOnOpenSidebar} />)

    expect(await screen.findByText('Panneau Twitch public')).toBeInTheDocument()
    expect(screen.getByText(/\/panel\/channel-1$/)).toBeInTheDocument()

    fireEvent.click(screen.getByTestId('mobile-menu-btn'))
    expect(mockOnOpenSidebar).toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: 'Copier le lien' }))
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Lien copié' })).toBeInTheDocument()
    })
  })

  it('renders viewer progress when a viewer id is available', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn((input: RequestInfo | URL) => {
        const url = String(input)

        if (url.includes('/achievements/channel/channel-1')) {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: () => Promise.resolve(mockAchievements),
          })
        }

        if (url.includes('/achievements/user/viewer-1/channel/channel-1')) {
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

    render(<PublicTwitchPanel channelId="channel-1" viewerId="viewer-1" />)

    expect(await screen.findByText('Progression du viewer')).toBeInTheDocument()
    expect(screen.getByText('Chat Master')).toBeInTheDocument()
    expect(screen.getByText('25/100')).toBeInTheDocument()
  })

  it('renders the viewer empty state in English', async () => {
    localStorage.setItem('stream-quest_language', 'en')
    vi.stubGlobal(
      'fetch',
      vi.fn((input: RequestInfo | URL) => {
        const url = String(input)

        if (url.includes('/achievements/channel/channel-1')) {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: () => Promise.resolve([]),
          })
        }

        if (url.includes('/achievements/user/viewer-1/channel/channel-1')) {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: () => Promise.resolve([]),
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

    render(<PublicTwitchPanel channelId="channel-1" viewerId="viewer-1" />)

    expect(await screen.findByText('Viewer Progress')).toBeInTheDocument()
    expect(screen.getByText('No viewer progress is available yet.')).toBeInTheDocument()
  })

  it('renders the empty state when no public achievement is available', async () => {
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

    render(<PublicTwitchPanel channelId="channel-1" />)

    expect(
      await screen.findByText(
        'Aucun succès public n’est disponible pour cette chaîne pour le moment.'
      )
    ).toBeInTheDocument()
  })

  it('renders the error state when the backend fails', async () => {
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

    render(<PublicTwitchPanel channelId="channel-1" />)

    expect(
      await screen.findByText('Le service de succès est actuellement indisponible.')
    ).toBeInTheDocument()
  })
})
