import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '../utils/test-utils'
import { Marketplace } from '../../features/marketplace/Marketplace'
import React from 'react'

const mockAchievements = [
  {
    id: '1',
    title: 'Speed Runner',
    description: 'Complete a game in under 2 hours',
    goal: 2,
    reward: 1000,
    label: 'SR',
    public: true,
    downloads: 234,
    visits: 980,
    active: true,
    secret: false,
    image: null,
    channelId: null,
    type: {
      label: 'message',
      data: null,
    },
  },
  {
    id: '2',
    title: 'Hype Train Conductor',
    description: 'Participate in 5 hype trains',
    goal: 5,
    reward: 500,
    label: '',
    public: true,
    downloads: 567,
    visits: 1200,
    active: false,
    secret: true,
    image: null,
    channelId: null,
    type: {
      label: 'redeem_channel_point',
      data: null,
    },
  },
]

describe('Marketplace', () => {
  const mockOnOpenSidebar = vi.fn()
  const mockOnUseTemplate = vi.fn()

  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve(mockAchievements),
        })
      )
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('should render the marketplace page', async () => {
    render(<Marketplace onOpenSidebar={mockOnOpenSidebar} onUseTemplate={mockOnUseTemplate} />)

    expect(screen.getByRole('heading', { name: 'Marketplace communautaire' })).toBeInTheDocument()
    expect(await screen.findByText('Speed Runner')).toBeInTheDocument()
  })

  it('should display achievement cards from the API', async () => {
    render(<Marketplace onOpenSidebar={mockOnOpenSidebar} onUseTemplate={mockOnUseTemplate} />)

    expect(await screen.findByText('Speed Runner')).toBeInTheDocument()
    expect(screen.getByText('Hype Train Conductor')).toBeInTheDocument()
  })

  it('should show search input', async () => {
    render(<Marketplace onOpenSidebar={mockOnOpenSidebar} onUseTemplate={mockOnUseTemplate} />)

    await screen.findByText('Speed Runner')
    expect(
      screen.getByPlaceholderText('Trouver de nouvelles quêtes pour votre communauté...')
    ).toBeInTheDocument()
  })

  it('should display category filters from trigger labels', async () => {
    render(<Marketplace onOpenSidebar={mockOnOpenSidebar} onUseTemplate={mockOnUseTemplate} />)

    await screen.findByText('Speed Runner')
    expect(screen.getByText('Tous')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Message' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Redeem Channel Point' })).toBeInTheDocument()
  })

  it('should toggle filters on mobile', async () => {
    render(<Marketplace onOpenSidebar={mockOnOpenSidebar} onUseTemplate={mockOnUseTemplate} />)

    await screen.findByText('Speed Runner')
    fireEvent.click(screen.getByTestId('mobile-filter-btn'))

    expect(screen.getByTestId('close-filters-btn')).toBeInTheDocument()
  })

  it('should handle category selection', async () => {
    render(<Marketplace onOpenSidebar={mockOnOpenSidebar} onUseTemplate={mockOnUseTemplate} />)

    await screen.findByText('Speed Runner')
    fireEvent.click(screen.getByRole('button', { name: 'Redeem Channel Point' }))

    await waitFor(() => {
      expect(screen.queryByText('Speed Runner')).not.toBeInTheDocument()
    })
    expect(screen.getByText('Hype Train Conductor')).toBeInTheDocument()
  })

  it('should handle detailed interactions', async () => {
    render(<Marketplace onOpenSidebar={mockOnOpenSidebar} onUseTemplate={mockOnUseTemplate} />)

    await screen.findByText('Speed Runner')
    fireEvent.click(screen.getByTestId('mobile-filter-btn'))

    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: 'highestReward' },
    })

    screen.getAllByText('Utiliser comme modèle').forEach(button => fireEvent.click(button))

    fireEvent.click(screen.getByLabelText('Secrets uniquement'))
    expect(screen.getByText('Hype Train Conductor')).toBeInTheDocument()
  })

  it('should toggle mobile filters sidebar', async () => {
    render(<Marketplace onOpenSidebar={mockOnOpenSidebar} onUseTemplate={mockOnUseTemplate} />)

    await screen.findByText('Speed Runner')
    fireEvent.click(screen.getByTestId('mobile-filter-btn'))
    fireEvent.click(screen.getByTestId('close-filters-btn'))
    fireEvent.click(screen.getByTestId('mobile-menu-btn'))

    expect(mockOnOpenSidebar).toHaveBeenCalled()
  })

  it('should display achievement stats', async () => {
    render(<Marketplace onOpenSidebar={mockOnOpenSidebar} onUseTemplate={mockOnUseTemplate} />)

    await screen.findByText('Speed Runner')
    expect(screen.getByText('234')).toBeInTheDocument()
    expect(screen.getByText('980')).toBeInTheDocument()
    expect(screen.getByText('1000 XP')).toBeInTheDocument()
  })

  it('should filter achievements with search', async () => {
    render(<Marketplace onOpenSidebar={mockOnOpenSidebar} onUseTemplate={mockOnUseTemplate} />)

    await screen.findByText('Speed Runner')
    fireEvent.change(
      screen.getByPlaceholderText('Trouver de nouvelles quêtes pour votre communauté...'),
      {
        target: { value: 'Hype' },
      }
    )

    await waitFor(() => {
      expect(screen.queryByText('Speed Runner')).not.toBeInTheDocument()
    })
    expect(screen.getByText('Hype Train Conductor')).toBeInTheDocument()
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

    render(<Marketplace onOpenSidebar={mockOnOpenSidebar} onUseTemplate={mockOnUseTemplate} />)

    expect(await screen.findByText('Aucun succès public trouvé')).toBeInTheDocument()
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

    render(<Marketplace onOpenSidebar={mockOnOpenSidebar} onUseTemplate={mockOnUseTemplate} />)

    expect(
      await screen.findByText('Le service de succès est actuellement indisponible.')
    ).toBeInTheDocument()
  })

  it('should pass the selected public achievement to the creator flow', async () => {
    render(<Marketplace onOpenSidebar={mockOnOpenSidebar} onUseTemplate={mockOnUseTemplate} />)

    const templateButtons = await screen.findAllByText('Utiliser comme modèle')
    fireEvent.click(templateButtons[0])

    expect(mockOnUseTemplate).toHaveBeenCalledWith(mockAchievements[0])
  })
})
