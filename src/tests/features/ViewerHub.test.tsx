import React from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '../utils/test-utils'
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

  it('renders the viewer hub with grouped channels and web links', async () => {
    Object.defineProperty(window.navigator, 'clipboard', {
      value: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
      configurable: true,
    })

    render(<ViewerHub onOpenSidebar={vi.fn()} />)

    expect(await screen.findByRole('heading', { name: 'Hub viewer' })).toBeInTheDocument()
    expect(screen.getByText('Chaînes suivies')).toBeInTheDocument()
    expect(screen.getByText('Chaîne channel-1')).toBeInTheDocument()
    expect(screen.getByText('Chaîne channel-2')).toBeInTheDocument()
    expect(screen.getByText('First Steps')).toBeInTheDocument()
    expect(screen.getAllByText('?').length).toBeGreaterThan(0)

    fireEvent.click(screen.getAllByRole('button', { name: 'Copier le lien web' })[0])
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Lien copié' })).toBeInTheDocument()
    })
  })
})
