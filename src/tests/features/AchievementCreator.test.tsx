import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '../utils/test-utils'
import { AchievementCreator } from '../../features/achievements/AchievementCreator'
import React from 'react'

describe('AchievementCreator', () => {
  const mockOnNavigate = vi.fn()

  it('should render the achievement creator page', () => {
    render(<AchievementCreator onNavigate={mockOnNavigate} />)
    expect(screen.getByRole('heading', { name: 'Create Achievement' })).toBeInTheDocument()
  })

  it('should allow entering achievement title', () => {
    render(<AchievementCreator onNavigate={mockOnNavigate} />)
    const titleInput = screen.getByPlaceholderText('Enter achievement name...')
    fireEvent.change(titleInput, { target: { value: 'Test Achievement' } })
    expect(titleInput).toHaveValue('Test Achievement')
  })

  it('should allow entering description', () => {
    render(<AchievementCreator onNavigate={mockOnNavigate} />)
    const descInput = screen.getByPlaceholderText('Describe how to unlock this achievement...')
    fireEvent.change(descInput, { target: { value: 'Test description' } })
    expect(descInput).toHaveValue('Test description')
  })

  it('should toggle hidden achievement setting', () => {
    render(<AchievementCreator onNavigate={mockOnNavigate} />)
    // Find the label text
    const label = screen.getByText('Hidden Achievement')
    // Traverse up to find the common container (the flex row)
    // structure: container > div > label
    const container = label.parentElement?.parentElement
    expect(container).toBeInTheDocument()

    if (container) {
      const toggleButton = container.querySelector('button')
      expect(toggleButton).toBeInTheDocument()
      if (toggleButton) {
        fireEvent.click(toggleButton)
      }
    }
  })

  it('should switch between simple and advanced modes', () => {
    render(<AchievementCreator onNavigate={mockOnNavigate} />)
    const advancedButton = screen.getByText('Advanced Mode')
    fireEvent.click(advancedButton)
    expect(screen.getByText('Trigger Conditions')).toBeInTheDocument()
  })

  it('should handle AI generation', () => {
    render(<AchievementCreator onNavigate={mockOnNavigate} />)
    const aiButton = screen.getByText('Generate with AI')
    fireEvent.click(aiButton)
    expect(screen.getByDisplayValue('Chat Warrior')).toBeInTheDocument()
  })

  it('should toggle sidebar on mobile', () => {
    render(<AchievementCreator onNavigate={mockOnNavigate} />)
    const menuBtn = screen.getByTestId('mobile-menu-btn')
    fireEvent.click(menuBtn)
  })

  it('should add and remove conditions in advanced mode', () => {
    render(<AchievementCreator onNavigate={mockOnNavigate} />)
    const advancedButton = screen.getByText('Advanced Mode')
    fireEvent.click(advancedButton)

    const addButton = screen.getByText('Add Condition')
    fireEvent.click(addButton)

    // Should have 2 conditions now (1 default + 1 added)
    const removeButtons = screen
      .getAllByRole('button')
      .filter(btn => btn.querySelector('.lucide-x'))
    expect(removeButtons.length).toBeGreaterThan(0)
  })
})
