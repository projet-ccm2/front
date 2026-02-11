import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import App from '../App'

describe('Integration Tests', () => {
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

  it('should render Landing Page initially', async () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: /Gamify Your Stream/i })).toBeInTheDocument()
  })

  it('should show Dashboard when user is authenticated', async () => {
    setupAuthenticated()
    render(<App />)

    await waitFor(
      () => {
        expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument()
      },
      { timeout: 5000 }
    )

    expect(screen.getByText('Active Achievements')).toBeInTheDocument()
    expect(screen.getByText('Active Users')).toBeInTheDocument()
  })
})
