import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '../utils/test-utils'
import { SuccessManagement } from '../../features/achievements/SuccessManagement'
import React from 'react'

const mockAchievements = [
  {
    id: '1',
    title: 'First Steps',
    description: 'Watch your first stream',
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
    id: '2',
    title: 'Chat Master',
    description: 'Send 100 messages in chat',
    goal: 100,
    reward: 250,
    label: '',
    public: false,
    downloads: 0,
    visits: 0,
    active: false,
    secret: true,
    image: null,
    channelId: 'channel-1',
    type: {
      label: 'message_content',
      data: null,
    },
  },
]

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

describe('SuccessManagement', () => {
  const mockOnNavigate = vi.fn()
  const mockOnOpenSidebar = vi.fn()
  const mockOnEditAchievement = vi.fn()
  const confirmSpy = vi.spyOn(window, 'confirm')
  const mockFetch = vi.fn((input: RequestInfo | URL) => {
    const url = String(input)

    if (url.includes('/achievements/channel/')) {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockAchievements),
      })
    }

    if (url.includes('/activate')) {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            ...mockAchievements[1],
            active: true,
          }),
      })
    }

    if (url.includes('/deactivate')) {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            ...mockAchievements[0],
            active: false,
          }),
      })
    }

    if (url.match(/\/achievements\/[^/]+$/)) {
      return Promise.resolve({
        ok: true,
        status: 204,
        json: () => Promise.resolve(undefined),
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
    confirmSpy.mockReturnValue(true)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    localStorage.clear()
    confirmSpy.mockReset()
  })

  function renderManagement() {
    return render(
      <SuccessManagement
        onEditAchievement={mockOnEditAchievement}
        onNavigate={mockOnNavigate}
        onOpenSidebar={mockOnOpenSidebar}
      />
    )
  }

  it('should render the management dashboard', async () => {
    renderManagement()

    expect(screen.getByRole('heading', { name: 'Gérer les succès' })).toBeInTheDocument()
    expect(screen.getByText('Activez, désactivez et modifiez vos quêtes')).toBeInTheDocument()
    expect(await screen.findByText(/Chaîne/)).toBeInTheDocument()
  })

  it('should render achievement list items from the API', async () => {
    renderManagement()

    expect(await screen.findByText('First Steps')).toBeInTheDocument()
    expect(screen.getByText('Watch your first stream')).toBeInTheDocument()
    expect(screen.getByText('Chat Master')).toBeInTheDocument()
    expect(screen.getAllByText('Récompense :').length).toBeGreaterThan(0)
  })

  it('should allow navigation to create new achievement', async () => {
    renderManagement()

    await screen.findByText('First Steps')
    fireEvent.click(screen.getByText('Créer'))

    expect(mockOnNavigate).toHaveBeenCalledWith('creator')
  })

  it('should render search input', async () => {
    renderManagement()

    await screen.findByText('First Steps')
    expect(screen.getByPlaceholderText('Rechercher des succès...')).toBeInTheDocument()
  })

  it('should render filter options', async () => {
    renderManagement()

    await screen.findByText('First Steps')
    expect(screen.getByText('Tous les succès')).toBeInTheDocument()
  })

  it('should toggle sidebar on mobile', async () => {
    renderManagement()

    await screen.findByText('First Steps')
    fireEvent.click(screen.getByTestId('mobile-menu-btn'))

    expect(mockOnOpenSidebar).toHaveBeenCalled()
  })

  it('should filter achievements by search', async () => {
    renderManagement()

    await screen.findByText('First Steps')
    fireEvent.change(screen.getByPlaceholderText('Rechercher des succès...'), {
      target: { value: 'Chat' },
    })

    await waitFor(() => {
      expect(screen.queryByText('First Steps')).not.toBeInTheDocument()
    })
    expect(screen.getByText('Chat Master')).toBeInTheDocument()
  })

  it('should filter achievements by active status', async () => {
    renderManagement()

    await screen.findByText('First Steps')
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'disabled' } })

    await waitFor(() => {
      expect(screen.queryByText('First Steps')).not.toBeInTheDocument()
    })
    expect(screen.getByText('Chat Master')).toBeInTheDocument()
  })

  it('should render an empty state when the API returns no achievements', async () => {
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

    renderManagement()

    expect(await screen.findByText('Aucun succès pour cette chaîne')).toBeInTheDocument()
  })

  it('should render an error state when the API fails', async () => {
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

    renderManagement()

    expect(
      await screen.findByText('Le service de succès est actuellement indisponible.')
    ).toBeInTheDocument()
  })

  it('should toggle an achievement activation state optimistically', async () => {
    renderManagement()

    const toggleButton = await screen.findByLabelText('Désactiver First Steps')
    fireEvent.click(toggleButton)

    expect(await screen.findByLabelText('Activer First Steps')).toBeInTheDocument()

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/achievements/1/deactivate'),
        expect.objectContaining({ method: 'PATCH' })
      )
    })
  })

  it('should roll back the toggle when the API fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn((input: RequestInfo | URL) => {
        const url = String(input)

        if (url.includes('/achievements/channel/')) {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: () => Promise.resolve(mockAchievements),
          })
        }

        if (url.includes('/deactivate')) {
          return Promise.resolve({
            ok: false,
            status: 502,
            json: () => Promise.resolve({ message: 'bad gateway' }),
            text: () => Promise.resolve('bad gateway'),
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

    renderManagement()

    fireEvent.click(await screen.findByLabelText('Désactiver First Steps'))

    expect(
      await screen.findByText('Impossible de mettre à jour « First Steps ». Veuillez réessayer.')
    ).toBeInTheDocument()
    expect(await screen.findByLabelText('Désactiver First Steps')).toBeInTheDocument()
  })

  it('should delete an achievement after confirmation', async () => {
    renderManagement()

    fireEvent.click(await screen.findByLabelText('Supprimer First Steps'))

    // Dialog should appear with French confirmation text
    expect(await screen.findByText('Supprimer le succès')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Supprimer'))

    await waitFor(() => {
      expect(screen.queryByText('First Steps')).not.toBeInTheDocument()
    })
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/achievements/1'),
      expect.objectContaining({ method: 'DELETE' })
    )
  })

  it('should roll back deletion when the API fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input)

        if (url.includes('/achievements/channel/')) {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: () => Promise.resolve(mockAchievements),
          })
        }

        if (init?.method === 'DELETE') {
          return Promise.resolve({
            ok: false,
            status: 502,
            json: () => Promise.resolve({ message: 'bad gateway' }),
            text: () => Promise.resolve('bad gateway'),
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

    renderManagement()

    fireEvent.click(await screen.findByLabelText('Supprimer First Steps'))

    // Dialog appears â€” confirm deletion
    expect(await screen.findByText('Supprimer le succès')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Supprimer'))

    expect(
      await screen.findByText('Impossible de supprimer « First Steps ». Veuillez réessayer.')
    ).toBeInTheDocument()
    expect(await screen.findByText('First Steps')).toBeInTheDocument()
  })

  it('should open edit mode for the selected achievement', async () => {
    renderManagement()

    fireEvent.click(await screen.findByLabelText('Modifier First Steps'))

    expect(mockOnEditAchievement).toHaveBeenCalledWith('1')
  })
})
