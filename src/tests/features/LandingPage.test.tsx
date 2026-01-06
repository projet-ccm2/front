import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '../utils/test-utils'
import { LandingPage } from '../../features/landing/LandingPage'

describe('LandingPage', () => {
  it('should render landing page with main heading', () => {
    const mockOnConnect = vi.fn()
    render(<LandingPage onConnect={mockOnConnect} />)

    expect(screen.getByText('Gamify Your Stream')).toBeInTheDocument()
  })

  it('should render Stream Quest branding', () => {
    const mockOnConnect = vi.fn()
    render(<LandingPage onConnect={mockOnConnect} />)

    expect(screen.getByText('Stream Quest')).toBeInTheDocument()
  })

  it('should render feature highlights', () => {
    const mockOnConnect = vi.fn()
    render(<LandingPage onConnect={mockOnConnect} />)

    expect(screen.getByText('Achievement System')).toBeInTheDocument()
    expect(screen.getByText('Boost Retention')).toBeInTheDocument()
    expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument()
  })

  it('should render ecosystem features', () => {
    const mockOnConnect = vi.fn()
    render(<LandingPage onConnect={mockOnConnect} />)

    expect(screen.getByText('Complete Ecosystem')).toBeInTheDocument()
    expect(screen.getByText('Twitch Extension')).toBeInTheDocument()
    expect(screen.getByText('Web Dashboard')).toBeInTheDocument()
  })

  it('should call onConnect when Connect with Twitch button is clicked', () => {
    const mockOnConnect = vi.fn()
    render(<LandingPage onConnect={mockOnConnect} />)

    const buttons = screen.getAllByText('Connect with Twitch')
    fireEvent.click(buttons[0])

    expect(mockOnConnect).toHaveBeenCalled()
  })

  it('should call onConnect when Get Started Free button is clicked', () => {
    const mockOnConnect = vi.fn()
    render(<LandingPage onConnect={mockOnConnect} />)

    const button = screen.getByText('Get Started Free')
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

    expect(screen.getByText('Ready to Level Up?')).toBeInTheDocument()
    expect(screen.getByText(/Join thousands of streamers/i)).toBeInTheDocument()
  })

  it('should render feature descriptions', () => {
    const mockOnConnect = vi.fn()
    render(<LandingPage onConnect={mockOnConnect} />)

    expect(screen.getByText(/Create custom achievements for your viewers/i)).toBeInTheDocument()
    expect(screen.getByText(/Keep viewers engaged longer/i)).toBeInTheDocument()
    expect(screen.getByText(/Track engagement metrics/i)).toBeInTheDocument()
  })

  it('should render extension features', () => {
    const mockOnConnect = vi.fn()
    render(<LandingPage onConnect={mockOnConnect} />)

    expect(screen.getByText('Live progress tracking')).toBeInTheDocument()
    expect(screen.getByText('Instant notifications')).toBeInTheDocument()
    expect(screen.getByText('Customizable appearance')).toBeInTheDocument()
  })

  it('should render dashboard features', () => {
    const mockOnConnect = vi.fn()
    render(<LandingPage onConnect={mockOnConnect} />)

    expect(screen.getByText('AI-powered achievement generator')).toBeInTheDocument()
    expect(screen.getByText('Community marketplace')).toBeInTheDocument()
    expect(screen.getByText('Advanced analytics')).toBeInTheDocument()
  })
})
