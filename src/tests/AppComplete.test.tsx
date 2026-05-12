import React from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from './utils/test-utils'
import App from '../App'

describe('App - Functional Coverage', () => {
  const setupAuthenticated = () => {
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
  }

  beforeEach(() => {
    window.history.pushState({}, '', '/')
    localStorage.clear()
    vi.clearAllMocks()
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('should render landing page initially', () => {
    render(<App />)
    expect(screen.getByText('Gamifiez votre stream')).toBeInTheDocument()
  })

  it('should handle authenticated state and show dashboard', async () => {
    setupAuthenticated()
    render(<App />)

    const dashboardElements = await screen.findAllByText('Tableau de bord')
    expect(dashboardElements.length).toBeGreaterThan(0)
  })

  it('should navigate between screens', async () => {
    setupAuthenticated()
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
                { username: 'testuser', userId: '123456', xp: 500 },
                { username: 'viewer1', userId: '999', xp: 200 },
              ]),
          })
        }

        if (url.includes('/achievements/channel/123')) {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: () =>
              Promise.resolve([
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
                  channelId: '123',
                  type: { label: 'message', data: null },
                },
              ]),
          })
        }

        if (url.includes('/achievements/user/123456/channel/123')) {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: () =>
              Promise.resolve([
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
                  channelId: '123',
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
          ok: true,
          status: 200,
          json: () => Promise.resolve([]),
        })
      })
    )

    render(<App />)
    await screen.findAllByText('Tableau de bord')

    fireEvent.click(screen.getAllByRole('button', { name: /G.*succ.*s|Manage Achievements/i })[0])
    expect(await screen.findByText('Tous les succès')).toBeInTheDocument()

    fireEvent.click(screen.getAllByRole('button', { name: /Profil utilisateur|User Profile/i })[0])
    expect(await screen.findByRole('heading', { name: 'Classement' })).toBeInTheDocument()
  }, 10000)

  it('should maintain authentication state', async () => {
    setupAuthenticated()
    render(<App />)
    const dashboardElements = await screen.findAllByText('Tableau de bord')
    expect(dashboardElements.length).toBeGreaterThan(0)
  })

  it('should reuse a marketplace template from the creator flow', async () => {
    setupAuthenticated()
    vi.stubGlobal(
      'fetch',
      vi.fn((input: RequestInfo | URL) => {
        const url = String(input)

        if (url.includes('/achievements/public')) {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: () =>
              Promise.resolve([
                {
                  id: 'template-1',
                  title: 'Template One',
                  description: 'Template description',
                  goal: 10,
                  reward: 100,
                  label: 'T1',
                  public: true,
                  downloads: 1,
                  visits: 2,
                  active: true,
                  secret: false,
                  image: null,
                  channelId: 'channel-public',
                  type: { label: 'message', data: null },
                },
              ]),
          })
        }

        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve([]),
        })
      })
    )

    render(<App />)
    await screen.findAllByText('Tableau de bord')

    fireEvent.click(screen.getAllByRole('button', { name: /Marketplace/i })[0])
    expect(await screen.findByRole('heading', { name: /Marketplace/i })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /Use as Template|Utiliser comme mod.*le/i }))
    expect(
      await screen.findByRole('heading', { name: /Créer un succès|Create Achievement/i })
    ).toBeInTheDocument()
  })

  it('should render the viewer hub from the sidebar navigation', async () => {
    setupAuthenticated()
    window.history.pushState({}, '', '/')
    vi.stubGlobal(
      'fetch',
      vi.fn((input: RequestInfo | URL) => {
        const url = String(input)

        if (url.includes('/achievements/user/123456')) {
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
                  image: null,
                  channelId: '123',
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
          ok: true,
          status: 200,
          json: () => Promise.resolve([]),
        })
      })
    )

    render(<App />)
    await screen.findAllByText('Tableau de bord')

    fireEvent.click(screen.getAllByRole('button', { name: /Hub viewer|Viewer Hub/i })[0])

    expect(
      await screen.findByRole('heading', { name: /Hub viewer|Viewer Hub/i })
    ).toBeInTheDocument()
    expect(screen.getAllByText(/Chaînes suivies|Tracked channels/i).length).toBeGreaterThan(0)
  })
})
