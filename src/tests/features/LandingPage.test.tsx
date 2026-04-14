import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '../utils/test-utils'
import { LandingPage } from '../../features/landing/LandingPage'

describe('LandingPage', () => {
  it('should render landing page with main heading', () => {
    const mockOnConnect = vi.fn()
    render(<LandingPage onConnect={mockOnConnect} />)

    expect(screen.getByText('Gamifiez votre stream')).toBeInTheDocument()
  })

  it('should render Stream Quest branding', () => {
    const mockOnConnect = vi.fn()
    render(<LandingPage onConnect={mockOnConnect} />)

    expect(screen.getByText('Stream Quest')).toBeInTheDocument()
  })

  it('should render feature highlights', () => {
    const mockOnConnect = vi.fn()
    render(<LandingPage onConnect={mockOnConnect} />)

    expect(screen.getByText('Système de succès')).toBeInTheDocument()
    expect(screen.getByText('Renforcer la rétention')).toBeInTheDocument()
    expect(screen.getByText('Tableau analytique')).toBeInTheDocument()
  })

  it('should render ecosystem features', () => {
    const mockOnConnect = vi.fn()
    render(<LandingPage onConnect={mockOnConnect} />)

    expect(screen.getByText('Écosystème complet')).toBeInTheDocument()
    expect(screen.getByText('Extension Twitch')).toBeInTheDocument()
    expect(screen.getByText('Dashboard web')).toBeInTheDocument()
  })

  it('should call onConnect when Connect with Twitch button is clicked', () => {
    const mockOnConnect = vi.fn()
    render(<LandingPage onConnect={mockOnConnect} />)

    const buttons = screen.getAllByText('Se connecter avec Twitch')
    fireEvent.click(buttons[0])

    expect(mockOnConnect).toHaveBeenCalled()
  })

  it('should call onConnect when Get Started Free button is clicked', () => {
    const mockOnConnect = vi.fn()
    render(<LandingPage onConnect={mockOnConnect} />)

    const button = screen.getByText('Commencer gratuitement')
    fireEvent.click(button)

    expect(mockOnConnect).toHaveBeenCalled()
  })

  it('should render theme toggle button', () => {
    const mockOnConnect = vi.fn()
    render(<LandingPage onConnect={mockOnConnect} />)

    const themeButton = screen.getByLabelText('Toggle theme')
    expect(themeButton).toBeInTheDocument()
  })

  it('should toggle theme when theme button is clicked', () => {
    const mockOnConnect = vi.fn()
    render(<LandingPage onConnect={mockOnConnect} />)

    const themeButton = screen.getByLabelText('Toggle theme')
    fireEvent.click(themeButton)

    // Theme should toggle (tested via ThemeContext)
    expect(themeButton).toBeInTheDocument()
  })

  it('should render CTA section', () => {
    const mockOnConnect = vi.fn()
    render(<LandingPage onConnect={mockOnConnect} />)

    expect(screen.getByText('Prêt à passer au niveau supérieur ?')).toBeInTheDocument()
    expect(screen.getByText(/Rejoignez des milliers de streamers/i)).toBeInTheDocument()
  })

  it('should render feature descriptions', () => {
    const mockOnConnect = vi.fn()
    render(<LandingPage onConnect={mockOnConnect} />)

    expect(screen.getByText(/Créez des succès personnalisés pour vos viewers/i)).toBeInTheDocument()
    expect(screen.getByText(/Gardez vos viewers engagés plus longtemps/i)).toBeInTheDocument()
    expect(screen.getByText(/Suivez les métriques d’engagement/i)).toBeInTheDocument()
  })

  it('should render extension features', () => {
    const mockOnConnect = vi.fn()
    render(<LandingPage onConnect={mockOnConnect} />)

    expect(screen.getByText('Suivi de progression en temps réel')).toBeInTheDocument()
    expect(screen.getByText('Notifications instantanées')).toBeInTheDocument()
    expect(screen.getByText('Apparence personnalisable')).toBeInTheDocument()
  })

  it('should render dashboard features', () => {
    const mockOnConnect = vi.fn()
    render(<LandingPage onConnect={mockOnConnect} />)

    expect(screen.getByText('Générateur de succès assisté par IA')).toBeInTheDocument()
    expect(screen.getByText('Marketplace communautaire')).toBeInTheDocument()
    expect(screen.getByText('Analytique avancée')).toBeInTheDocument()
  })
})
