import React from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '../utils/test-utils'
import { TwitchExtensionPanel } from '../../features/overlay/TwitchExtensionPanel'

const mockChannelAchievements = [
  {
    id: 'ach-1',
    title: 'Extension Hero',
    description: 'Finish the live quest',
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
  },
]

const mockViewerAchievements = [
  {
    id: 'viewer-ach-1',
    title: 'Watcher',
    description: 'Watch 10 streams',
    goal: 10,
    reward: 200,
    label: '',
    public: true,
    downloads: 0,
    visits: 0,
    active: true,
    secret: false,
    image: null,
    channelId: 'channel-1',
    type: { label: 'message', data: null },
    userState: {
      progressCount: 5,
      finished: false,
      acquiredDate: null,
    },
  },
]

describe('TwitchExtensionPanel', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
    window.history.pushState({}, '', '/twitch-extension/panel')
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    localStorage.clear()
  })

  it('renders the extension URL without a preview channel', () => {
    render(<TwitchExtensionPanel />)

    expect(screen.getByRole('heading', { name: 'Extension Twitch' })).toBeInTheDocument()
    expect(screen.getByText(/\/twitch-extension\/panel$/)).toBeInTheDocument()
    expect(
      screen.getByText(/Pour prévisualiser le panneau en local, ajoute \?channelId=.../)
    ).toBeInTheDocument()
  })

  it('renders a local preview when channel and viewer ids are provided', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn((input: RequestInfo | URL) => {
        const url = String(input)

        if (url.includes('/achievements/channel/channel-1')) {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: () => Promise.resolve(mockChannelAchievements),
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

    window.history.pushState(
      {},
      '',
      '/twitch-extension/panel?channelId=channel-1&viewerId=viewer-1'
    )
    render(<TwitchExtensionPanel />)

    expect(await screen.findByText('Progression du viewer')).toBeInTheDocument()
    expect(screen.getByText('Watcher')).toBeInTheDocument()
    expect(screen.getByText('5/10')).toBeInTheDocument()
  })
})
