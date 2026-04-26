import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '../utils/test-utils'
import { AchievementCreator } from '../../features/achievements/AchievementCreator'
import { toast } from 'sonner'
import React from 'react'

vi.mock('sonner', () => ({
  toast: Object.assign(vi.fn(), {
    success: vi.fn(),
    error: vi.fn(),
  }),
}))

const marketplaceTemplate = {
  id: 'template-1',
  title: 'Marketplace Template',
  description: 'Imported from marketplace',
  goal: 75,
  reward: 300,
  label: 'MT',
  public: true,
  downloads: 123,
  visits: 456,
  active: true,
  secret: false,
  image: null,
  channelId: null,
  type: {
    label: 'contentMessage' as const,
    data: 'gg',
  },
}

describe('AchievementCreator', () => {
  const mockOnOpenSidebar = vi.fn()
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

  const mockFetch = vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input)

    if (url.match(/\/achievements$/) && init?.method === 'POST') {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            id: 'created-achievement',
            ...JSON.parse(String(init.body)),
            downloads: 0,
            visits: 0,
          }),
      })
    }

    if (url.includes('/achievements/edit-1') && !init?.method) {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            id: 'edit-1',
            title: 'Existing Achievement',
            description: 'Existing description',
            goal: 300,
            reward: 600,
            label: 'EA',
            public: true,
            downloads: 0,
            visits: 0,
            active: true,
            secret: false,
            image: null,
            channelId: 'channel-1',
            type: {
              label: 'countMessage',
              data: null,
            },
          }),
      })
    }

    if (url.includes('/achievements/edit-1') && init?.method === 'PUT') {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            id: 'edit-1',
            ...JSON.parse(String(init.body)),
            downloads: 0,
            visits: 0,
            channelId: 'channel-1',
          }),
      })
    }

    if (url.includes('/achievements/ai-suggestion') && init?.method === 'POST') {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            title: 'Chat Warrior',
            description: "Débloquez ce succès après l'envoi de 250 messages dans le chat.",
            goal: 250,
            reward: 250,
            public: false,
            active: true,
            secret: false,
            type: {
              label: 'contentMessage',
              data: 'hello',
            },
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

  beforeEach(() => {
    localStorage.setItem('twitch_user', JSON.stringify(authUser))
    mockFetch.mockClear()
    vi.mocked(toast.success).mockClear()
    vi.mocked(toast.error).mockClear()
    vi.stubGlobal('fetch', mockFetch)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    localStorage.clear()
  })

  it('should render the achievement creator page', () => {
    render(<AchievementCreator onOpenSidebar={mockOnOpenSidebar} />)
    expect(screen.getByRole('heading', { name: 'Créer un succès' })).toBeInTheDocument()
  })

  it('should prefill the form from a marketplace template', async () => {
    render(
      <AchievementCreator
        templateAchievement={marketplaceTemplate}
        onOpenSidebar={mockOnOpenSidebar}
      />
    )

    expect(
      screen.getByText(/Marketplace Template.*chargé depuis la marketplace/i)
    ).toBeInTheDocument()
    expect(screen.getByDisplayValue('Marketplace Template')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Imported from marketplace')).toBeInTheDocument()
    expect(screen.getByLabelText('Récompense (XP / Points)')).toHaveValue(300)
    expect(screen.getByText('Mode simple')).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Messages envoyés' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Contenu du message' })).toBeInTheDocument()
    expect(screen.getByLabelText(/Méthode de déblocage/i)).toHaveValue('contentMessage')
    expect(screen.getByLabelText(/Détails du déclencheur/i)).toHaveValue('gg')
    expect(screen.getByLabelText('Objectif')).toHaveValue(75)
  })

  it('should allow entering achievement title', () => {
    render(<AchievementCreator onOpenSidebar={mockOnOpenSidebar} />)
    const titleInput = screen.getByPlaceholderText('Entrez le nom du succès...')
    fireEvent.change(titleInput, { target: { value: 'Test Achievement' } })
    expect(titleInput).toHaveValue('Test Achievement')
  })

  it('should allow entering description', () => {
    render(<AchievementCreator onOpenSidebar={mockOnOpenSidebar} />)
    const descInput = screen.getByPlaceholderText('Décrivez comment débloquer ce succès...')
    fireEvent.change(descInput, { target: { value: 'Test description' } })
    expect(descInput).toHaveValue('Test description')
  })

  it('should toggle secret achievement setting', () => {
    render(<AchievementCreator onOpenSidebar={mockOnOpenSidebar} />)
    const toggle = screen.getByRole('button', { name: /Succès secret/i })
    fireEvent.click(toggle)
    fireEvent.click(toggle)
    expect(toggle).toBeInTheDocument()
  })

  it('should toggle public and active achievement states', () => {
    render(<AchievementCreator onOpenSidebar={mockOnOpenSidebar} />)

    const publicToggle = screen.getByRole('button', { name: /Modèle public/i })
    const activeToggle = screen.getByRole('button', { name: /Actif/i })

    fireEvent.click(publicToggle)
    fireEvent.click(activeToggle)

    expect(publicToggle).toBeInTheDocument()
    expect(activeToggle).toBeInTheDocument()
  })

  it('should switch between simple mode and the API feature preview', () => {
    render(<AchievementCreator onOpenSidebar={mockOnOpenSidebar} />)
    fireEvent.click(screen.getByText('Mode simple'))
    expect(screen.getByLabelText(/Méthode de déblocage/i)).toBeInTheDocument()
    fireEvent.click(screen.getByText('API'))
    expect(screen.getByLabelText('Objectif')).toBeInTheDocument()
    expect(screen.queryByLabelText(/Méthode de déblocage/i)).not.toBeInTheDocument()
  })

  it('should reset the trigger type when switching back from API mode', () => {
    render(<AchievementCreator onOpenSidebar={mockOnOpenSidebar} />)

    fireEvent.click(screen.getByText('API'))
    fireEvent.click(screen.getByText('Mode simple'))

    expect(screen.getByLabelText(/Méthode de déblocage/i)).toHaveValue('countMessage')
  })

  it('should render the default AI prompt', () => {
    render(<AchievementCreator onOpenSidebar={mockOnOpenSidebar} />)
    expect(
      screen.getByDisplayValue(/Créer un succès pour un utilisateur qui envoie 100 messages/i)
    ).toBeInTheDocument()
  })

  it('should prefill the form from the AI suggestion route', async () => {
    render(<AchievementCreator onOpenSidebar={mockOnOpenSidebar} />)

    fireEvent.click(screen.getByText("Générer avec l'IA"))

    expect(await screen.findByDisplayValue('Chat Warrior')).toBeInTheDocument()
    expect(screen.getByLabelText(/Méthode de déblocage/i)).toHaveValue('contentMessage')
    expect(screen.getByLabelText(/Détails du déclencheur/i)).toHaveValue('hello')
    expect(screen.getByLabelText('Objectif')).toHaveValue(250)
    expect(screen.getByLabelText('Récompense (XP / Points)')).toHaveValue(250)

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/achievements/ai-suggestion'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            prompt: 'Créer un succès pour un utilisateur qui envoie 100 messages',
          }),
        })
      )
    })
  })

  it('should apply an AI suggestion trigger even when the backend returns an alternate trigger alias', async () => {
    mockFetch.mockImplementationOnce((input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input)

      if (url.includes('/achievements/ai-suggestion') && init?.method === 'POST') {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () =>
            Promise.resolve({
              title: 'Points Hunter',
              description: 'Spend points to unlock this success.',
              goal: 25,
              reward: 80,
              public: true,
              active: true,
              secret: false,
              unlockingMethod: 'countRedeemChannelPoint',
              triggerData: 'vip',
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

    render(<AchievementCreator onOpenSidebar={mockOnOpenSidebar} />)

    fireEvent.click(screen.getByText("Générer avec l'IA"))

    expect(await screen.findByDisplayValue('Points Hunter')).toBeInTheDocument()
    expect(screen.getByLabelText(/Méthode de déblocage/i)).toHaveValue('countRedeemChannelPoint')
    expect(screen.getByLabelText(/récompense de point de chaîne/i)).toHaveValue('vip')
  })

  it('should toggle sidebar on mobile', () => {
    render(<AchievementCreator onOpenSidebar={mockOnOpenSidebar} />)
    fireEvent.click(screen.getByTestId('mobile-menu-btn'))
    expect(mockOnOpenSidebar).toHaveBeenCalled()
  })

  it('should allow editing goal and reward', () => {
    render(<AchievementCreator onOpenSidebar={mockOnOpenSidebar} />)
    const goalInput = screen.getByLabelText('Combien de fois')
    const rewardInput = screen.getByLabelText('Récompense (XP / Points)')

    fireEvent.change(goalInput, { target: { value: '300' } })
    fireEvent.change(rewardInput, { target: { value: '500' } })

    expect(goalInput).toHaveValue(300)
    expect(rewardInput).toHaveValue(500)
  })

  it('should render all form elements', () => {
    render(<AchievementCreator onOpenSidebar={mockOnOpenSidebar} />)

    expect(screen.getByText('Icône du succès')).toBeInTheDocument()
    expect(screen.getByText('Titre du succès')).toBeInTheDocument()
    expect(screen.getByText('Description')).toBeInTheDocument()
    expect(screen.getByText('Combien de fois')).toBeInTheDocument()
    expect(screen.getByText('Récompense (XP / Points)')).toBeInTheDocument()
    expect(screen.getByText('Enregistrer le brouillon')).toBeInTheDocument()
    expect(screen.getByText('Publier le succès')).toBeInTheDocument()
  })

  it('should render AI generation banner', () => {
    render(<AchievementCreator onOpenSidebar={mockOnOpenSidebar} />)

    expect(screen.getByText('Génération par IA')).toBeInTheDocument()
    expect(
      screen.getByText("Laissez l'IA créer un succès basé sur le contexte de votre chaîne")
    ).toBeInTheDocument()
    expect(screen.getByLabelText('AI Prompt')).toBeInTheDocument()
  })

  it('should render version info', () => {
    render(<AchievementCreator onOpenSidebar={mockOnOpenSidebar} />)

    expect(screen.getByText('Version 1.0')).toBeInTheDocument()
    expect(screen.getByText("C'est un nouveau succès")).toBeInTheDocument()
  })

  it('should render upload button and image state', () => {
    render(<AchievementCreator onOpenSidebar={mockOnOpenSidebar} />)

    expect(screen.getByText(/Télécharger une image/i)).toBeInTheDocument()
    expect(screen.getByText(/Effacer l'image/i)).toBeInTheDocument()
    expect(screen.getByText(/Recommandé/i)).toBeInTheDocument()
    expect(
      screen.getByText(
        /Aucune image sélectionnée\. Téléchargez-en une pour qu'elle soit gérée lors de la publication\./i
      )
    ).toBeInTheDocument()
  })

  it('should open the file picker when the upload button is clicked', () => {
    const clickSpy = vi.spyOn(HTMLInputElement.prototype, 'click').mockImplementation(() => {})

    render(<AchievementCreator onOpenSidebar={mockOnOpenSidebar} />)

    fireEvent.click(screen.getByRole('button', { name: 'Télécharger une image' }))

    expect(clickSpy).toHaveBeenCalled()
    clickSpy.mockRestore()
  })

  it('should prepare an image upload payload and send it through achievement-management', async () => {
    render(<AchievementCreator onOpenSidebar={mockOnOpenSidebar} />)

    const fileInput = screen.getByTestId('achievement-image-input')
    const imageFile = new File(['image-bytes'], 'achievement.png', { type: 'image/png' })

    fireEvent.change(fileInput, {
      target: { files: [imageFile] },
    })

    expect(
      await screen.findByText('Image « achievement.png » prête à être uploadée.')
    ).toBeInTheDocument()

    fireEvent.change(screen.getByPlaceholderText('Entrez le nom du succès...'), {
      target: { value: 'First 100 Messages' },
    })
    fireEvent.change(screen.getByPlaceholderText('Décrivez comment débloquer ce succès...'), {
      target: { value: 'Unlock after 100 messages.' },
    })
    fireEvent.click(screen.getByText('Publier le succès'))

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Le succès « First 100 Messages » a été publié.')
    })

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/achievements'),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('"image":null'),
        })
      )
    })

    const createCall = mockFetch.mock.calls.find(([url, init]) => {
      return String(url).endsWith('/achievements') && init?.method === 'POST'
    })
    const body = JSON.parse(String(createCall?.[1]?.body ?? '{}')) as {
      image: string | null
      imageUpload?: {
        fileName: string
        mimeType: string
        contentBase64: string
      } | null
    }

    expect(body.image).toBeNull()
    expect(body.imageUpload).toMatchObject({
      fileName: 'achievement.png',
      mimeType: 'image/png',
    })
    expect(body.imageUpload?.contentBase64).toContain('data:image/png;base64,')
  })

  it('should render simple mode trigger fields', () => {
    render(<AchievementCreator onOpenSidebar={mockOnOpenSidebar} />)

    expect(screen.getByLabelText(/Méthode de déblocage/i)).toBeInTheDocument()
    // Trigger detail is hidden for the default "countMessage" trigger
    expect(screen.queryByLabelText(/Détails du déclencheur/i)).not.toBeInTheDocument()
    // Switch to contentMessage to reveal the detail field
    fireEvent.change(screen.getByLabelText(/Méthode de déblocage/i), {
      target: { value: 'contentMessage' },
    })
    expect(screen.getByLabelText(/Détails du déclencheur/i)).toBeInTheDocument()
  })

  it('should allow changing trigger type and trigger data', () => {
    render(<AchievementCreator onOpenSidebar={mockOnOpenSidebar} />)

    const triggerSelect = screen.getByLabelText(/Méthode de déblocage/i)
    // Switch to contentMessage to show the trigger data input
    fireEvent.change(triggerSelect, { target: { value: 'contentMessage' } })

    const triggerDataInput = screen.getByLabelText(/Détails du déclencheur/i)
    fireEvent.change(triggerDataInput, { target: { value: 'hello world' } })

    expect(triggerSelect).toHaveValue('contentMessage')
    expect(triggerDataInput).toHaveValue('hello world')
  })

  it('should block publishing when trigger type requires data but data is empty', async () => {
    render(<AchievementCreator onOpenSidebar={mockOnOpenSidebar} />)

    fireEvent.change(screen.getByPlaceholderText('Entrez le nom du succès...'), {
      target: { value: 'Test Achievement' },
    })
    fireEvent.change(screen.getByPlaceholderText('Décrivez comment débloquer ce succès...'), {
      target: { value: 'Test description' },
    })
    fireEvent.change(screen.getByLabelText(/Méthode de déblocage/i), {
      target: { value: 'contentMessage' },
    })
    // Leave trigger data empty
    fireEvent.click(screen.getByText('Publier le succès'))

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        'Une valeur de détail est requise pour ce type de déclencheur.'
      )
    })
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('should show the cost input for channel_point_cost trigger type', () => {
    render(<AchievementCreator onOpenSidebar={mockOnOpenSidebar} />)

    fireEvent.change(screen.getByLabelText(/Méthode de déblocage/i), {
      target: { value: 'countCostChannelPoint' },
    })

    expect(screen.getByLabelText('Coût minimum en points')).toBeInTheDocument()
    expect(screen.getByLabelText('Coût minimum en points')).toHaveAttribute('type', 'number')
  })

  it('should block publishing when channel_point_cost data is not a positive integer', async () => {
    render(<AchievementCreator onOpenSidebar={mockOnOpenSidebar} />)

    fireEvent.change(screen.getByPlaceholderText('Entrez le nom du succès...'), {
      target: { value: 'Test Achievement' },
    })
    fireEvent.change(screen.getByPlaceholderText('Décrivez comment débloquer ce succès...'), {
      target: { value: 'Test description' },
    })
    fireEvent.change(screen.getByLabelText(/Méthode de déblocage/i), {
      target: { value: 'countCostChannelPoint' },
    })
    fireEvent.click(screen.getByText('Publier le succès'))

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        'Le coût en points de chaîne doit être un entier positif.'
      )
    })
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('should show an error when the AI prompt is empty', async () => {
    render(<AchievementCreator onOpenSidebar={mockOnOpenSidebar} />)

    fireEvent.change(screen.getByLabelText('AI Prompt'), { target: { value: '   ' } })
    fireEvent.click(screen.getByText("Générer avec l'IA"))

    expect(
      await screen.findByText('Entrez une description avant de demander une suggestion.')
    ).toBeInTheDocument()
  })

  it('should show an error when the AI suggestion request fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 502,
          json: () => Promise.resolve({ countMessage: 'bad gateway' }),
          text: () => Promise.resolve('bad gateway'),
        })
      )
    )

    render(<AchievementCreator onOpenSidebar={mockOnOpenSidebar} />)

    fireEvent.click(screen.getByText("Générer avec l'IA"))

    expect(
      await screen.findByText('Impossible de générer une suggestion IA pour le moment.')
    ).toBeInTheDocument()
  })

  it('should publish the achievement to the create route', async () => {
    render(<AchievementCreator onOpenSidebar={mockOnOpenSidebar} />)

    fireEvent.change(screen.getByPlaceholderText('Entrez le nom du succès...'), {
      target: { value: 'First 100 Messages' },
    })
    fireEvent.change(screen.getByPlaceholderText('Décrivez comment débloquer ce succès...'), {
      target: { value: 'Unlock after 100 messages.' },
    })
    fireEvent.change(screen.getByLabelText('Combien de fois'), {
      target: { value: '100' },
    })
    fireEvent.change(screen.getByLabelText('Récompense (XP / Points)'), {
      target: { value: '250' },
    })

    fireEvent.click(screen.getByText('Publier le succès'))

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Le succès « First 100 Messages » a été publié.')
    })

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/achievements'),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('"label":"dummy label"'),
        })
      )
    })

    const createBody = String(
      mockFetch.mock.calls.find(([url, init]) => {
        return String(url).endsWith('/achievements') && init?.method === 'POST'
      })?.[1]?.body ?? ''
    )

    expect(createBody).toContain('"imageUpload":null')
  })

  it('should block publishing for synthetic moderator channel ids', async () => {
    localStorage.setItem(
      'twitch_user',
      JSON.stringify({
        ...authUser,
        channelsWhichIsMod: ['ModChannel'],
      })
    )

    render(<AchievementCreator onOpenSidebar={mockOnOpenSidebar} />)

    fireEvent.click(screen.getByText('MyChannel'))
    fireEvent.click(screen.getByText('ModChannel'))
    fireEvent.click(screen.getByText('Publier le succès'))

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        'La gestion des succès ne prend actuellement en charge que la chaîne du compte connecté. Les chaînes modératrices ne sont pas encore gérées.'
      )
    })
  })

  it('should load an existing achievement in edit mode', async () => {
    render(<AchievementCreator achievementId="edit-1" onOpenSidebar={mockOnOpenSidebar} />)

    expect(await screen.findByDisplayValue('Existing Achievement')).toBeInTheDocument()
    expect(screen.getByLabelText('Combien de fois')).toHaveValue(300)
    expect(screen.getByText('Modifier le succès')).toBeInTheDocument()
  })

  it('should update an existing achievement through the update route', async () => {
    render(<AchievementCreator achievementId="edit-1" onOpenSidebar={mockOnOpenSidebar} />)

    expect(await screen.findByDisplayValue('Existing Achievement')).toBeInTheDocument()
    fireEvent.change(screen.getByPlaceholderText('Entrez le nom du succès...'), {
      target: { value: 'Updated Achievement' },
    })
    fireEvent.click(screen.getByText('Mettre à jour le succès'))

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        'Le succès « Updated Achievement » a été mis à jour.'
      )
    })

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/achievements/edit-1'),
        expect.objectContaining({
          method: 'PUT',
          body: expect.stringContaining('"label":"dummy label"'),
        })
      )
    })

    const updateBody = String(
      mockFetch.mock.calls.find(([url, init]) => {
        return String(url).includes('/achievements/edit-1') && init?.method === 'PUT'
      })?.[1]?.body ?? ''
    )

    expect(updateBody).toContain('"imageUpload":null')
  })
})
