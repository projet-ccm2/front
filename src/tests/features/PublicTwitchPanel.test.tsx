import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '../utils/test-utils'
import { PublicTwitchPanel } from '../../features/overlay/PublicTwitchPanel'

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

const state = {
  channelAchievements: [] as AchievementLike[],
  viewerAchievements: [] as AchievementLike[],
  channelLoading: false,
  channelError: null as string | null,
  viewerLoading: false,
  viewerError: null as string | null,
}

vi.mock('../../context/LanguageContext', async importOriginal => {
  const actual = await importOriginal<typeof import('../../context/LanguageContext')>()
  return {
    ...actual,
    useLanguage: () => ({
      t: (key: string, params?: Record<string, string | number>) => {
        const map: Record<string, string> = {
          'overlay.public.badge': 'Panneau Twitch public',
          'overlay.public.title': 'Lien public du panneau',
          'overlay.public.subtitle': 'Partage cette URL dans un panneau Twitch sous ton live.',
          'overlay.public.copyHint': 'Copier le lien public',
          'overlay.metric.achievements': 'Succès',
          'overlay.metric.hidden': 'Cachés',
          'overlay.public.linkSection': 'URL publique',
          'overlay.public.linkDescription':
            'Colle ce lien dans un panneau Twitch pour afficher le tableau des succès.',
          'overlay.public.copy': 'Copier le lien',
          'overlay.public.copied': 'Lien copié',
          'overlay.loading': 'Chargement des succès du viewer...',
          'overlay.public.empty': 'Aucun succès public n’est disponible pour cette chaîne.',
          'overlay.public.achievements': 'Succès de la chaîne',
          'overlay.public.achievementsDescription':
            'Les succès secrets restent cachés derrière un point d’interrogation jusqu’à leur publication.',
          'overlay.public.howToTitle': 'Comment l’utiliser',
          'overlay.public.howToDescription':
            'Ajoute cette URL dans un panneau Twitch ou dans une extension.',
          'overlay.public.step1': 'Copie le lien.',
          'overlay.public.step2': 'Colle-le dans Twitch.',
          'overlay.public.step3': 'Partage-le avec ton audience.',
          'overlay.public.note': 'Note de panneau public.',
          'overlay.viewer.title': 'Progression du viewer',
          'overlay.viewer.description': 'Affiche la progression du viewer quand il est identifié.',
          'overlay.viewer.hint': 'Identifie un viewer pour personnaliser le panneau.',
          'overlay.viewer.empty': 'Aucune progression de viewer n’est disponible pour le moment.',
          'marketplace.active': 'Actif',
          'marketplace.visible': 'Visible',
          'achievements.hidden.title': 'Succès caché',
          'achievements.hidden.description': 'Complète l’objectif pour révéler ce succès.',
          'achievements.status.unlocked': 'Débloqué',
          'achievements.status.progress': `En cours ${params?.current ?? 0}/${params?.goal ?? 0}`,
        }

        if (key === 'overlay.metric.achievements') return `Succès ${params?.count ?? ''}`
        if (key === 'overlay.metric.hidden') return 'Cachés'
        return map[key] ?? key
      },
    }),
  }
})

vi.mock('../../features/achievements/hooks/useChannelAchievements', () => ({
  useChannelAchievements: () => ({
    achievements: state.channelAchievements,
    isLoading: state.channelLoading,
    errorMessage: state.channelError,
  }),
}))

vi.mock('../../features/overlay/hooks/usePublicViewerAchievements', () => ({
  usePublicViewerAchievements: () => ({
    achievements: state.viewerAchievements,
    isLoading: state.viewerLoading,
    errorMessage: state.viewerError,
  }),
}))

describe('PublicTwitchPanel', () => {
  beforeEach(() => {
    state.channelAchievements = []
    state.viewerAchievements = []
    state.channelLoading = false
    state.channelError = null
    state.viewerLoading = false
    state.viewerError = null
    vi.stubGlobal('navigator', {
      language: 'fr-FR',
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    } as unknown as Navigator)
  })

  it('renders the empty state and viewer hint when no achievements are available', () => {
    render(<PublicTwitchPanel channelId="channel-1" />)

    expect(screen.getByText('Panneau Twitch public')).toBeInTheDocument()
    expect(
      screen.getByText('Aucun succès public n’est disponible pour cette chaîne.')
    ).toBeInTheDocument()
    expect(
      screen.getByText('Identifie un viewer pour personnaliser le panneau.')
    ).toBeInTheDocument()
  })

  it('renders loading and error states', () => {
    state.channelLoading = true
    render(<PublicTwitchPanel channelId="channel-1" />)
    expect(screen.getByText('Chargement des succès du viewer...')).toBeInTheDocument()
  })

  it('does nothing when the clipboard API is unavailable', () => {
    vi.stubGlobal('navigator', {
      language: 'fr-FR',
    } as unknown as Navigator)

    render(<PublicTwitchPanel channelId="channel-1" />)

    fireEvent.click(screen.getByRole('button', { name: 'Copier le lien' }))

    expect(screen.getByRole('button', { name: 'Copier le lien' })).toBeInTheDocument()
  })

  it('renders public achievements and viewer progression', () => {
    state.channelAchievements = [
      {
        id: 'public-1',
        title: 'Public Steps',
        description: 'Do the thing',
        goal: 10,
        reward: 50,
        label: 'PS',
        public: true,
        downloads: 0,
        visits: 0,
        active: true,
        secret: false,
        image: null,
        channelId: 'channel-1',
        type: { label: 'countMessage', data: '10' },
      },
    ]
    state.viewerAchievements = [
      {
        id: 'viewer-1',
        title: 'Viewer Steps',
        description: 'Keep going',
        goal: 10,
        reward: 50,
        label: 'VS',
        public: true,
        downloads: 0,
        visits: 0,
        active: true,
        secret: false,
        image: null,
        channelId: 'channel-1',
        type: { label: 'countMessage', data: '10' },
        userState: { progressCount: 4, finished: false, acquiredDate: null },
      },
    ]

    render(<PublicTwitchPanel channelId="channel-1" viewerId="viewer-1" />)

    expect(screen.getByText('Succès de la chaîne')).toBeInTheDocument()
    expect(screen.getByText('Public Steps')).toBeInTheDocument()
    expect(screen.getByText('Progression du viewer')).toBeInTheDocument()
    expect(screen.getByText('Viewer Steps')).toBeInTheDocument()
  })

  it('renders hidden achievements with the secret marker when no viewer progress is available', () => {
    state.channelAchievements = [
      {
        id: 'secret-1',
        title: 'Hidden Quest',
        description: 'Secret channel objective',
        goal: 25,
        reward: 150,
        label: 'HQ',
        public: false,
        downloads: 0,
        visits: 0,
        active: true,
        secret: true,
        image: null,
        channelId: 'channel-1',
        type: { label: 'countMessage', data: '25' },
      },
    ]

    render(<PublicTwitchPanel channelId="channel-1" />)

    expect(screen.getByText('?')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /Succ.*cach/i })).toBeInTheDocument()
    expect(screen.getByText('150 XP')).toBeInTheDocument()
  })

  it('copies the panel url', async () => {
    state.channelAchievements = [
      {
        id: 'public-1',
        title: 'Public Steps',
        description: 'Do the thing',
        goal: 10,
        reward: 50,
        label: 'PS',
        public: true,
        downloads: 0,
        visits: 0,
        active: true,
        secret: false,
        image: null,
        channelId: 'channel-1',
        type: { label: 'countMessage', data: '10' },
      },
    ]

    render(<PublicTwitchPanel channelId="channel-1" />)

    fireEvent.click(screen.getByRole('button', { name: 'Copier le lien' }))

    await waitFor(() => {
      expect(screen.getByText('Lien copié')).toBeInTheDocument()
    })
  })
})
