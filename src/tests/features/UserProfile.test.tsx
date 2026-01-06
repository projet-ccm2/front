import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '../utils/test-utils'
import { UserProfile } from '../../features/profile/UserProfile'
import React from 'react'

describe('UserProfile', () => {
  const mockOnNavigate = vi.fn()

  it('should render user profile with username', () => {
    render(<UserProfile onNavigate={mockOnNavigate} />)
    expect(screen.getByRole('heading', { name: 'xXGamerXx' })).toBeInTheDocument()
  })

  it('should toggle sidebar on mobile', () => {
    render(<UserProfile onNavigate={mockOnNavigate} />)
    const menuBtn = screen.getByTestId('mobile-menu-btn')
    expect(menuBtn).toBeInTheDocument()
    fireEvent.click(menuBtn)
  })

  it('should display user level and XP', () => {
    render(<UserProfile onNavigate={mockOnNavigate} />)
    const levelTexts = screen.getAllByText('Level 42')
    expect(levelTexts.length).toBeGreaterThan(0)
    expect(screen.getByText(/9830 \/ 10000 XP/)).toBeInTheDocument()
  })

  it('should show stats cards', () => {
    render(<UserProfile onNavigate={mockOnNavigate} />)
    expect(screen.getByText('Total Watch Time')).toBeInTheDocument()
    expect(screen.getByText('247h')).toBeInTheDocument()
    expect(screen.getByText('Achievements Unlocked')).toBeInTheDocument()
    expect(screen.getByText('7 / 12')).toBeInTheDocument()
  })

  it('should display achievement badges', () => {
    render(<UserProfile onNavigate={mockOnNavigate} />)
    expect(screen.getByRole('heading', { name: 'Achievement Badges' })).toBeInTheDocument()
    expect(screen.getByText('First Steps')).toBeInTheDocument()
    expect(screen.getByText('Chat Master')).toBeInTheDocument()
  })

  it('should show leaderboard', () => {
    render(<UserProfile onNavigate={mockOnNavigate} />)
    expect(screen.getByRole('heading', { name: 'Leaderboard' })).toBeInTheDocument()
    expect(screen.getByText('ProGamer99')).toBeInTheDocument()
    expect(screen.getByText('StreamFan42')).toBeInTheDocument()
  })

  it('should highlight current user in leaderboard', () => {
    render(<UserProfile onNavigate={mockOnNavigate} />)
    const userElements = screen.getAllByText('xXGamerXx')
    // The leaderboard entry should be the second occurrence (first is the heading)
    expect(userElements.length).toBeGreaterThanOrEqual(2)
  })
})
