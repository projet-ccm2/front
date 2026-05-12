import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '../utils/test-utils'
import { ChannelBadgeManager } from '../../features/badges/ChannelBadgeManager'
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

const mockBadge = {
  id: 'badge-1',
  title: 'Top Fan',
  image: 'https://example.com/badge.png',
}

describe('ChannelBadgeManager', () => {
  beforeEach(() => {
    localStorage.setItem('twitch_user', JSON.stringify(authUser))
    vi.stubGlobal(
      'fetch',
      vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input)
        const method = init?.method ?? 'GET'

        if (url.includes('/badges/channel/channel-1') && method === 'GET') {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: () => Promise.resolve(mockBadge),
          })
        }

        if (url.includes('/badges/channel/channel-1') && method === 'PUT') {
          const body = JSON.parse(String(init?.body ?? '{}')) as {
            title?: string
            image?: string | null
            imageUpload?: { fileName: string; mimeType: string; contentBase64: string } | null
          }

          return Promise.resolve({
            ok: true,
            status: 200,
            json: () =>
              Promise.resolve({
                id: 'badge-1',
                title: body.title ?? 'Top Fan',
                image: body.imageUpload ? 'https://example.com/updated-badge.png' : body.image,
              }),
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

  it('renders the channel badge and saves title updates', async () => {
    render(<ChannelBadgeManager />)

    expect(await screen.findByRole('heading', { name: 'Badge de la chaîne' })).toBeInTheDocument()
    await screen.findByLabelText('Titre du badge')
    await waitFor(() => {
      expect(screen.getByLabelText('Titre du badge')).toHaveValue('Top Fan')
    })

    fireEvent.change(screen.getByLabelText('Titre du badge'), {
      target: { value: 'Super Fan' },
    })

    fireEvent.click(screen.getByRole('button', { name: 'Enregistrer le badge' }))

    await waitFor(() => {
      expect(screen.getByDisplayValue('Super Fan')).toBeInTheDocument()
    })

    expect(screen.getByText('Badge de chaîne mis à jour avec succès.')).toBeInTheDocument()
  })

  it('uploads a replacement image through imageUpload', async () => {
    render(<ChannelBadgeManager />)

    await screen.findByLabelText('Titre du badge')
    await waitFor(() => {
      expect(screen.getByLabelText('Titre du badge')).toHaveValue('Top Fan')
    })

    const fileInput = screen.getByTestId('channel-badge-image-input')
    const imageFile = new File(['image-bytes'], 'badge.png', { type: 'image/png' })

    fireEvent.change(fileInput, {
      target: { files: [imageFile] },
    })

    expect(await screen.findByText('Image "badge.png" prête à être uploadée.')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Enregistrer le badge' }))

    await waitFor(() => {
      expect(screen.getByAltText('Top Fan')).toHaveAttribute(
        'src',
        'https://example.com/updated-badge.png'
      )
    })
  })

  it('shows an empty state when no channel badge exists', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 404,
          json: () => Promise.resolve({ message: 'not found' }),
          text: () => Promise.resolve('not found'),
        })
      )
    )

    render(<ChannelBadgeManager />)

    expect(await screen.findByText('Aucun badge lié à cette chaîne')).toBeInTheDocument()
  })
})
