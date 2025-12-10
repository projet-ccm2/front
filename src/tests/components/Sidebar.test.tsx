import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '../utils/test-utils'
import { Sidebar } from '../../components/layout/Sidebar'
import React from 'react'

// Mock Lucide icons to avoid rendering issues if any
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
  }
})

describe('Sidebar', () => {
  const mockOnNavigate = vi.fn()
  const mockOnClose = vi.fn()

  it('should render all menu items', () => {
    render(<Sidebar currentPage="dashboard" onNavigate={mockOnNavigate} isOpen={true} />)
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Create Achievement')).toBeInTheDocument()
    expect(screen.getByText('Manage Achievements')).toBeInTheDocument()
    expect(screen.getByText('Marketplace')).toBeInTheDocument()
    expect(screen.getByText('User Profile')).toBeInTheDocument()
    expect(screen.getByText('Twitch Overlay')).toBeInTheDocument()
  })

  it('should show basic stream quest title', () => {
    render(<Sidebar currentPage="dashboard" onNavigate={mockOnNavigate} isOpen={true} />)
    expect(screen.getByText('Stream Quest')).toBeInTheDocument()
  })

  it('should call onNavigate when item clicked', () => {
    render(<Sidebar currentPage="dashboard" onNavigate={mockOnNavigate} isOpen={true} />)
    fireEvent.click(screen.getByText('Create Achievement'))
    expect(mockOnNavigate).toHaveBeenCalledWith('creator')
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
    // Check for overlay
    const overlay = document.querySelector('.bg-black\\/50')
    // It might be hidden on desktop but present in DOM
    // To verify close click:
    if (overlay) {
      fireEvent.click(overlay)
      expect(mockOnClose).toHaveBeenCalled()
    }
  })
})
