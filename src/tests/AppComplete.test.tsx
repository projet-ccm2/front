import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from './utils/test-utils'
import App from '../App'
import React from 'react'

describe('App - Functional Coverage', () => {
  it('should render landing page initially', () => {
    render(<App />)
    expect(screen.getByText('Gamify Your Stream')).toBeInTheDocument()
  })

  const setupAuthenticated = () => {
    const mockUser = {
      userId: '123456',
      username: 'testuser',
      channel: {
        id: '123',
        name: 'MyTwitchChannel',
        description: 'Test channel',
        profileImageUrl: 'http://example.com/image.png',
      },
      channelsWhichIsMod: ['ProGamingHub'],
    }
    localStorage.setItem('twitch_user', JSON.stringify(mockUser))
  }

  it('should render landing page initially', () => {
    render(<App />)
    expect(screen.getByText('Gamify Your Stream')).toBeInTheDocument()
  })

  it('should handle authenticated state and show dashboard', async () => {
    setupAuthenticated()
    render(<App />)

    // Should now show dashboard
    const dashboardElements = await screen.findAllByText('Dashboard')
    expect(dashboardElements.length).toBeGreaterThan(0)
  })

  it('should navigate between screens', async () => {
    setupAuthenticated()
    render(<App />)
    await screen.findAllByText('Dashboard')

    // Test one navigation (e.g. to Marketplace which seems stable)
    const marketplaceLinks = screen.getAllByText('Marketplace')
    fireEvent.click(marketplaceLinks[0])

    const marketplaceHeading = await screen.findByRole('heading', { name: /Marketplace/i })
    expect(marketplaceHeading).toBeInTheDocument()
  })

  it('should maintain authentication state', async () => {
    setupAuthenticated()
    render(<App />)
    const dashboardElements = await screen.findAllByText('Dashboard')
    expect(dashboardElements.length).toBeGreaterThan(0)
  })
})
