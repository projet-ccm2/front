import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '../utils/test-utils'
import { TwitchOverlay } from '../../features/overlay/TwitchOverlay'

type AchievementLike = {
  id: string
  title: string
  description: string
  goal: number
  reward: number
  label: string
  public: boolean
  downloads: number
  visits: number
  active: boolean
  secret: boolean
  image: string | null
  channelId: string | null
  type: {
    label: string
    data: string | null
  }
  userState?: {
    progressCount: number
    finished: boolean
    acquiredDate: string | null
  }
}

const mockState = {
  selectedChannel: {
    id: 'channel-1',
    name: 'My Channel',
  },
  achievements: [] as AchievementLike[],
  isLoading: false,
  errorMessage: null as string | null,
}

const translations: Record<string, string> = {
  'overlay.title': 'Panneau Twitch',
  'overlay.subtitle.channel': 'Panneau en direct pour My Channel',
  'overlay.subtitle.connected': 'Panneau en direct pour la chaîne connectée',
  'overlay.liveBadge': 'Panneau en direct',
  'overlay.metric.achievements': 'Succès',
  'overlay.metric.hidden': 'Cachés',
  'overlay.metric.xp': 'XP de succès',
  'overlay.metric.rank': 'Rang de la chaîne',
  'overlay.status.live': 'En direct',
  'overlay.loading': 'Chargement des succès du viewer...',
  'overlay.empty': 'Aucun succès disponible pour ce panneau pour le moment.',
  'overlay.section.viewerAchievements': 'Succès du viewer',
  'overlay.section.viewerDescription':
    'Les succès secrets restent cachés derrière un point d’interrogation jusqu’à leur déblocage.',
  'overlay.totalSuffix': '2 au total',
  'overlay.leaderboard': 'Classement',
  'overlay.leaderboardDescription':
    'Classé à partir des succès actuellement disponibles dans le panneau.',
  'overlay.public.linkSection': 'URL publique',
  'overlay.public.linkDescription':
    'Colle ce lien dans un panneau Twitch pour afficher le tableau des succès.',
  'overlay.public.copy': 'Copier le lien',
  'overlay.public.copied': 'Lien copié',
  'overlay.extension.section': 'URL de l’extension',
  'overlay.extension.description':
    'Partage cette URL avec Twitch dev pour configurer l’extension de panneau.',
  'overlay.extension.note':
    'Pour prévisualiser le panneau en local, ajoute ?channelId=... et éventuellement &viewerId=....',
  'achievements.status.unlocked': 'Débloqué',
  'achievements.status.progress': 'En cours',
  'achievements.hidden.title': 'Succès caché',
  'achievements.hidden.description': 'Complète l’objectif pour révéler ce succès.',
}

vi.mock('../../context/ChannelContext', async importOriginal => {
  const actual = await importOriginal<typeof import('../../context/ChannelContext')>()
  return {
    ...actual,
    useChannel: () => ({
      selectedChannel: mockState.selectedChannel,
    }),
  }
})

vi.mock('../../context/LanguageContext', async importOriginal => {
  const actual = await importOriginal<typeof import('../../context/LanguageContext')>()
  return {
    ...actual,
    useLanguage: () => ({
      t: (key: string, params?: Record<string, string | number>) => {
        if (key === 'overlay.totalSuffix') {
          return `${params?.count ?? 0} au total`
        }

        if (key === 'achievements.status.progress') {
          return `En cours ${params?.current ?? 0}/${params?.goal ?? 0}`
        }

        return translations[key] ?? key
      },
    }),
  }
})

vi.mock('../../features/profile/hooks/useUserAchievements', () => ({
  useUserAchievements: () => ({
    achievements: mockState.achievements,
    isLoading: mockState.isLoading,
    errorMessage: mockState.errorMessage,
  }),
}))

describe('TwitchOverlay', () => {
  beforeEach(() => {
    mockState.selectedChannel = {
      id: 'channel-1',
      name: 'My Channel',
    }
    mockState.achievements = []
    mockState.isLoading = false
    mockState.errorMessage = null
    vi.stubGlobal('navigator', {
      language: 'fr-FR',
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    } as unknown as Navigator)
  })

  it('renders the panel summary and achievements when data is available', () => {
    mockState.achievements = [
      {
        id: 'a-1',
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
        type: { label: 'countMessage', data: '1' },
        userState: {
          progressCount: 1,
          finished: true,
          acquiredDate: new Date().toISOString(),
        },
      },
      {
        id: 'a-2',
        title: 'Secret Quest',
        description: 'Hidden challenge',
        goal: 10,
        reward: 100,
        label: '',
        public: true,
        downloads: 0,
        visits: 0,
        active: true,
        secret: true,
        image: null,
        channelId: 'channel-1',
        type: { label: 'countMessage', data: '10' },
        userState: {
          progressCount: 3,
          finished: false,
          acquiredDate: null,
        },
      },
    ]

    render(<TwitchOverlay onOpenSidebar={vi.fn()} />)

    expect(screen.getByRole('heading', { name: 'Panneau Twitch' })).toBeInTheDocument()
    expect(screen.getByText(/My Channel/)).toBeInTheDocument()
    expect(screen.getByText('Succès')).toBeInTheDocument()
    expect(screen.getByText('Cachés')).toBeInTheDocument()
    expect(screen.getByText(/\/panel\/channel-1/)).toBeInTheDocument()
    expect(screen.getByText('URL de l’extension')).toBeInTheDocument()
    expect(screen.getAllByText('First Steps').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Secret Quest').length).toBeGreaterThan(0)
    expect(screen.getAllByText('?').length).toBeGreaterThan(0)
  })

  it('renders the loading state', () => {
    mockState.isLoading = true

    render(<TwitchOverlay onOpenSidebar={vi.fn()} />)

    expect(screen.getByText('Chargement des succès du viewer...')).toBeInTheDocument()
  })

  it('renders the error state', () => {
    mockState.errorMessage = 'Impossible de charger le hub viewer.'

    render(<TwitchOverlay onOpenSidebar={vi.fn()} />)

    expect(screen.getByText('Impossible de charger le hub viewer.')).toBeInTheDocument()
  })

  it('renders the connected subtitle and empty state when no channel is selected', () => {
    mockState.selectedChannel = null

    render(<TwitchOverlay onOpenSidebar={vi.fn()} />)

    expect(screen.getByText('Panneau en direct pour la chaîne connectée')).toBeInTheDocument()
    expect(
      screen.getByText('Aucun succès disponible pour ce panneau pour le moment.')
    ).toBeInTheDocument()
  })

  it('does nothing when copy is unavailable', async () => {
    mockState.achievements = [
      {
        id: 'a-1',
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
        type: { label: 'countMessage', data: '1' },
        userState: {
          progressCount: 1,
          finished: true,
          acquiredDate: new Date().toISOString(),
        },
      },
    ]

    vi.stubGlobal('navigator', {
      language: 'fr-FR',
    } as unknown as Navigator)

    render(<TwitchOverlay onOpenSidebar={vi.fn()} />)

    fireEvent.click(screen.getByRole('button', { name: 'Copier le lien' }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Copier le lien' })).toBeInTheDocument()
    })
  })

  it('keeps the copy state stable when clipboard write fails', async () => {
    mockState.achievements = [
      {
        id: 'a-1',
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
        type: { label: 'countMessage', data: '1' },
        userState: {
          progressCount: 1,
          finished: true,
          acquiredDate: new Date().toISOString(),
        },
      },
    ]

    vi.stubGlobal('navigator', {
      language: 'fr-FR',
      clipboard: {
        writeText: vi.fn().mockRejectedValue(new Error('denied')),
      },
    } as unknown as Navigator)

    render(<TwitchOverlay onOpenSidebar={vi.fn()} />)

    fireEvent.click(screen.getByRole('button', { name: 'Copier le lien' }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Copier le lien' })).toBeInTheDocument()
    })
  })

  it('copies the public panel url', async () => {
    mockState.achievements = [
      {
        id: 'a-1',
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
        type: { label: 'countMessage', data: '1' },
        userState: {
          progressCount: 1,
          finished: true,
          acquiredDate: new Date().toISOString(),
        },
      },
    ]

    render(<TwitchOverlay onOpenSidebar={vi.fn()} />)

    fireEvent.click(screen.getByRole('button', { name: 'Copier le lien' }))

    await waitFor(() => {
      expect(screen.getByText('Lien copié')).toBeInTheDocument()
    })
  })
})
