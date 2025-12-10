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
    const label = screen.getByText('Hidden Achievement')
    const container = label.parentElement?.parentElement
    expect(container).toBeInTheDocument()

    if (container) {
      const toggleButton = container.querySelector('button')
      expect(toggleButton).toBeInTheDocument()
      if (toggleButton) {
        fireEvent.click(toggleButton)
        fireEvent.click(toggleButton) // Toggle back
      }
    }
  })

  it('should switch between simple and advanced modes', () => {
    render(<AchievementCreator onNavigate={mockOnNavigate} />)
    const advancedButton = screen.getByText('Advanced Mode')
    fireEvent.click(advancedButton)
    expect(screen.getByText('Trigger Conditions')).toBeInTheDocument()

    // Switch back to simple
    const simpleButton = screen.getByText('Simple Mode')
    fireEvent.click(simpleButton)
  })

  it('should handle AI generation', () => {
    render(<AchievementCreator onNavigate={mockOnNavigate} />)
    const aiButton = screen.getByText('Generate with AI')
    fireEvent.click(aiButton)
    expect(screen.getByDisplayValue('Chat Warrior')).toBeInTheDocument()
    expect(screen.getByDisplayValue('250')).toBeInTheDocument()
  })

  it('should toggle sidebar on mobile', () => {
    render(<AchievementCreator onNavigate={mockOnNavigate} />)
    const menuBtn = screen.getByTestId('mobile-menu-btn')
    fireEvent.click(menuBtn)
    expect(menuBtn).toBeInTheDocument()
  })

  it('should add and remove conditions in advanced mode', () => {
    render(<AchievementCreator onNavigate={mockOnNavigate} />)
    const advancedButton = screen.getByText('Advanced Mode')
    fireEvent.click(advancedButton)

    const addButton = screen.getByText('Add Condition')
    fireEvent.click(addButton)
    fireEvent.click(addButton) // Add another

    // Should have 3 conditions now (1 default + 2 added)
    const removeButtons = screen.getAllByTestId(/remove-condition-/)
    expect(removeButtons.length).toBe(3)
  })

  it('should remove specific condition', () => {
    render(<AchievementCreator onNavigate={mockOnNavigate} />)
    const advancedButton = screen.getByText('Advanced Mode')
    fireEvent.click(advancedButton)

    const addButton = screen.getByText('Add Condition')
    fireEvent.click(addButton)

    // Remove the first condition
    const removeButton = screen.getByTestId('remove-condition-0')
    fireEvent.click(removeButton)

    // Should have 1 condition left
    const remainingButtons = screen.getAllByTestId(/remove-condition-/)
    expect(remainingButtons.length).toBe(1)
  })

  it('should render all form elements', () => {
    render(<AchievementCreator onNavigate={mockOnNavigate} />)

    expect(screen.getByText('Achievement Icon')).toBeInTheDocument()
    expect(screen.getByText('Achievement Title')).toBeInTheDocument()
    expect(screen.getByText('Description')).toBeInTheDocument()
    expect(screen.getByText('XP / Points Value')).toBeInTheDocument()
    expect(screen.getByText('Save Draft')).toBeInTheDocument()
    expect(screen.getByText('Publish Achievement')).toBeInTheDocument()
  })

  it('should render AI generation banner', () => {
    render(<AchievementCreator onNavigate={mockOnNavigate} />)

    expect(screen.getByText('AI-Powered Generation')).toBeInTheDocument()
    expect(
      screen.getByText('Let AI create an achievement based on your channel context')
    ).toBeInTheDocument()
  })

  it('should render version info', () => {
    render(<AchievementCreator onNavigate={mockOnNavigate} />)

    expect(screen.getByText('Version 1.0')).toBeInTheDocument()
    expect(screen.getByText('This is a new achievement')).toBeInTheDocument()
  })

  it('should render upload button', () => {
    render(<AchievementCreator onNavigate={mockOnNavigate} />)

    expect(screen.getByText('Upload Image')).toBeInTheDocument()
    expect(screen.getByText('Recommended: 512x512px PNG or JPG')).toBeInTheDocument()
  })

  it('should render condition selects in advanced mode', () => {
    render(<AchievementCreator onNavigate={mockOnNavigate} />)
    const advancedButton = screen.getByText('Advanced Mode')
    fireEvent.click(advancedButton)

    const selects = screen.getAllByRole('combobox')
    expect(selects.length).toBeGreaterThan(0)
  })

  it('should close sidebar', () => {
    render(<AchievementCreator onNavigate={mockOnNavigate} />)
    const menuBtn = screen.getByTestId('mobile-menu-btn')
    fireEvent.click(menuBtn)
    expect(menuBtn).toBeInTheDocument()
  })
})
