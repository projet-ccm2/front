import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import App from '../App'

describe('Integration Tests', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn((input: RequestInfo | URL) => {
        const url = String(input)

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
                  type: {
                    label: 'message',
                    data: null,
                  },
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
                  type: {
                    label: 'message',
                    data: null,
                  },
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
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    localStorage.clear()
  })

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

  it('should render Landing Page initially', async () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: /Gamifiez votre stream/i })).toBeInTheDocument()
  })

  it('should show Dashboard when user is authenticated', async () => {
    setupAuthenticated()
    render(<App />)

    await waitFor(
      () => {
        expect(screen.getByRole('heading', { name: 'Tableau de bord' })).toBeInTheDocument()
      },
      { timeout: 5000 }
    )

    await waitFor(
      () => {
        expect(screen.getByText('Succès actifs')).toBeInTheDocument()
        expect(screen.getByText('Modèles publics')).toBeInTheDocument()
      },
      { timeout: 5000 }
    )
  })
})
