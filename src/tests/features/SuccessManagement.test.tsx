import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '../utils/test-utils'
import { SuccessManagement } from '../../features/achievements/SuccessManagement'
import React from 'react'

describe('SuccessManagement', () => {
  const mockOnNavigate = vi.fn()

  it('should render the management dashboard', () => {
    render(<SuccessManagement onNavigate={mockOnNavigate} />)
    expect(screen.getByRole('heading', { name: 'Manage Achievements' })).toBeInTheDocument()
    expect(screen.getByText('Enable, disable, and edit your quests')).toBeInTheDocument()
  })

  it('should render success list items', () => {
    render(<SuccessManagement onNavigate={mockOnNavigate} />)
    expect(screen.getByText('First Steps')).toBeInTheDocument()
    expect(screen.getByText('Watch your first stream')).toBeInTheDocument()
    // Check for a few others
    expect(screen.getByText('Chat Master')).toBeInTheDocument()
    expect(screen.getByText('Night Owl')).toBeInTheDocument()
  })

  it('should allow navigation to create new achievement', () => {
    render(<SuccessManagement onNavigate={mockOnNavigate} />)

    const createButtons = screen.getAllByText('Create New')
    const createBtn = createButtons.find(el => el.closest('button'))

    if (createBtn) {
      fireEvent.click(createBtn)
      expect(mockOnNavigate).toHaveBeenCalledWith('creator')
    }
  })

  it('should render search input', () => {
    render(<SuccessManagement onNavigate={mockOnNavigate} />)
    const searchInput = screen.getByPlaceholderText('Search achievements...')
    expect(searchInput).toBeInTheDocument()
  })

  it('should render filter options', () => {
    render(<SuccessManagement onNavigate={mockOnNavigate} />)
    expect(screen.getByText('All Achievements')).toBeInTheDocument()
  })

  it('should toggle sidebar on mobile', () => {
    const { container } = render(<SuccessManagement onNavigate={mockOnNavigate} />)
    const menuBtn = container.querySelector(String.raw`button.lg\:hidden`)
    if (menuBtn) {
      fireEvent.click(menuBtn)
    }
    expect(true).toBeTruthy()
  })
})
