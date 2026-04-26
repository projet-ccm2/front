import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '../utils/test-utils'
import { TwitchExtensionPanel } from '../../features/overlay/TwitchExtensionPanel'

const publicPanelSpy = vi.fn(
  ({ channelId, viewerId }: { channelId: string; viewerId?: string | null }) => (
    <div>
      <span>{channelId}</span>
      <span>{viewerId ?? 'no-viewer'}</span>
    </div>
  )
)

vi.mock('../../context/LanguageContext', async importOriginal => {
  const actual = await importOriginal<typeof import('../../context/LanguageContext')>()
  return {
    ...actual,
    useLanguage: () => ({
      t: (key: string) =>
        ({
          'overlay.extension.title': 'Extension Twitch',
          'overlay.extension.subtitle':
            'Utilise cette URL dans la console développeur Twitch pour ton extension de panneau.',
          'overlay.extension.section': 'URL de l’extension',
          'overlay.extension.description':
            'Partage cette URL avec Twitch dev pour configurer l’extension de panneau.',
          'overlay.extension.copy': 'Copier l’URL de l’extension',
          'overlay.extension.copied': 'URL de l’extension copiée',
          'overlay.extension.note':
            'Pour prévisualiser le panneau en local, ajoute ?channelId=... et éventuellement &viewerId=....',
        })[key] ?? key,
    }),
  }
})

vi.mock('../../features/overlay/PublicTwitchPanel', () => ({
  PublicTwitchPanel: (props: { channelId: string; viewerId?: string | null }) =>
    publicPanelSpy(props),
}))

describe('TwitchExtensionPanel', () => {
  beforeEach(() => {
    publicPanelSpy.mockClear()
    vi.stubGlobal('navigator', {
      language: 'fr-FR',
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    } as unknown as Navigator)
  })

  it('renders the note when no preview channel is provided', () => {
    window.history.pushState({}, '', '/twitch-extension/panel')

    render(<TwitchExtensionPanel />)

    expect(screen.getAllByText('Extension Twitch').length).toBeGreaterThan(0)
    expect(
      screen.getByText(
        'Pour prévisualiser le panneau en local, ajoute ?channelId=... et éventuellement &viewerId=....'
      )
    ).toBeInTheDocument()
    expect(publicPanelSpy).not.toHaveBeenCalled()
  })

  it('renders the preview panel when a channel id is present', () => {
    window.history.pushState(
      {},
      '',
      '/twitch-extension/panel?channelId=channel-1&viewerId=viewer-1'
    )

    render(<TwitchExtensionPanel />)

    expect(screen.getByText('channel-1')).toBeInTheDocument()
    expect(screen.getByText('viewer-1')).toBeInTheDocument()
    expect(publicPanelSpy).toHaveBeenCalled()
    expect(publicPanelSpy.mock.calls[0]?.[0]).toEqual({
      channelId: 'channel-1',
      viewerId: 'viewer-1',
    })
  })

  it('copies the extension url', async () => {
    window.history.pushState({}, '', '/twitch-extension/panel?channelId=channel-1')

    render(<TwitchExtensionPanel />)

    fireEvent.click(screen.getByRole('button', { name: 'Copier l’URL de l’extension' }))

    await waitFor(() => {
      expect(screen.getByText('URL de l’extension copiée')).toBeInTheDocument()
    })
  })
})
