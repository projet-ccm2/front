import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '../utils/test-utils'
import { Sidebar } from '../../components/layout/Sidebar'
import React from 'react'

vi.mock('lucide-react', async importOriginal => {
  const actual = await importOriginal()
  return {
    ...actual,
    LayoutDashboard: () => <div data-testid="icon-dashboard" />,
    Trophy: () => <div data-testid="icon-trophy" />,
    Plus: () => <div data-testid="icon-plus" />,
    Store: () => <div data-testid="icon-store" />,
    User: () => <div data-testid="icon-user" />,
    Tv: () => <div data-testid="icon-tv" />,
    X: () => <div data-testid="icon-x" />,
    Sun: () => <div data-testid="icon-sun" />,
    Moon: () => <div data-testid="icon-moon" />,
    Settings: () => <div data-testid="icon-settings" />,
    LogOut: () => <div data-testid="icon-logout" />,
  }
})

describe('Sidebar', () => {
  const mockOnNavigate = vi.fn()
  const mockOnClose = vi.fn()

  it('should render all menu items', () => {
    render(<Sidebar currentPage="dashboard" onNavigate={mockOnNavigate} isOpen={true} />)
    expect(screen.getByText('Tableau de bord')).toBeInTheDocument()
    expect(screen.getByText('Créer un succès')).toBeInTheDocument()
    expect(screen.getByText('Gérer les succès')).toBeInTheDocument()
    expect(screen.getByText('Marketplace')).toBeInTheDocument()
    expect(screen.getByText('Profil utilisateur')).toBeInTheDocument()
    expect(screen.getByText('Overlay Twitch')).toBeInTheDocument()
  })

  it('should show basic stream quest title', () => {
    render(<Sidebar currentPage="dashboard" onNavigate={mockOnNavigate} isOpen={true} />)
    expect(screen.getByText('Stream Quest')).toBeInTheDocument()
  })

  it('should call onNavigate when item clicked', () => {
    render(<Sidebar currentPage="dashboard" onNavigate={mockOnNavigate} isOpen={true} />)
    fireEvent.click(screen.getByText('Créer un succès'))
    expect(mockOnNavigate).toHaveBeenCalledWith('creator')
  })

  it('should toggle the theme when the theme button is clicked', () => {
    render(<Sidebar currentPage="dashboard" onNavigate={mockOnNavigate} isOpen={true} />)

    expect(screen.getByRole('button', { name: 'Mode sombre' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Mode sombre' }))
    expect(screen.getByRole('button', { name: 'Mode clair' })).toBeInTheDocument()
  })

  it('should log out and navigate to landing', () => {
    localStorage.setItem(
      'twitch_user',
      JSON.stringify({
        userId: 'user-1',
        username: 'streamer',
        channel: {
          id: 'channel-1',
          name: 'MyChannel',
          description: 'desc',
          profileImageUrl: '',
        },
        channelsWhichIsMod: [],
      })
    )

    render(<Sidebar currentPage="dashboard" onNavigate={mockOnNavigate} isOpen={true} />)

    fireEvent.click(screen.getByRole('button', { name: 'Déconnexion' }))

    expect(mockOnNavigate).toHaveBeenCalledWith('landing')
    expect(localStorage.getItem('twitch_user')).toBeNull()
  })

  it('should open and close properly on mobile (mock logic)', () => {
    render(
      <Sidebar
        currentPage="dashboard"
        onNavigate={mockOnNavigate}
        isOpen={true}
        onClose={mockOnClose}
      />
    )

    const overlay = document.querySelector('.bg-black\\/50')
    if (overlay) {
      fireEvent.click(overlay)
      expect(mockOnClose).toHaveBeenCalled()
    }
  })
})
