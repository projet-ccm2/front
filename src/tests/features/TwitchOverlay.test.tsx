import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '../utils/test-utils'
import { TwitchOverlay } from '../../features/overlay/TwitchOverlay'
import React from 'react'

describe('TwitchOverlay', () => {
  const mockOnNavigate = vi.fn()
  const mockOnOpenSidebar = vi.fn()

  it('should render the overlay preview page', () => {
    render(<TwitchOverlay onNavigate={mockOnNavigate} onOpenSidebar={mockOnOpenSidebar} />)
    expect(screen.getByText('Twitch Extension Overlay')).toBeInTheDocument()
    expect(screen.getByText('Extension Preview')).toBeInTheDocument()
  })

  it('should render technical specifications', () => {
    render(<TwitchOverlay onNavigate={mockOnNavigate} onOpenSidebar={mockOnOpenSidebar} />)
    expect(screen.getByText('Technical Specifications')).toBeInTheDocument()
    expect(screen.getByText('320px')).toBeInTheDocument()
    expect(screen.getByText('Real-time')).toBeInTheDocument()
  })

  it('should render active quests preview', () => {
    render(<TwitchOverlay onNavigate={mockOnNavigate} onOpenSidebar={mockOnOpenSidebar} />)
    expect(screen.getByText('Active Quests')).toBeInTheDocument()
    // Check for specific quest content
    expect(screen.getByText('Chat Master')).toBeInTheDocument()
    expect(screen.getByText('Send 100 messages')).toBeInTheDocument()
  })

  it('should display level info', () => {
    render(<TwitchOverlay onNavigate={mockOnNavigate} onOpenSidebar={mockOnOpenSidebar} />)
    expect(screen.getByText('Level 42')).toBeInTheDocument()
  })

  it('should toggle sidebar on mobile', () => {
    render(<TwitchOverlay onNavigate={mockOnNavigate} onOpenSidebar={mockOnOpenSidebar} />)
    const menuBtn = screen.getByTestId('mobile-menu-btn')
    expect(menuBtn).toBeInTheDocument()
    fireEvent.click(menuBtn)
    expect(mockOnOpenSidebar).toHaveBeenCalled()
  })
})
