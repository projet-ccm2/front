import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent, waitFor } from './utils/test-utils'
import App from '../App'

describe('Integration Tests', () => {
  it('should navigate from Landing Page to Dashboard upon connection', async () => {
    render(<App />)

    // 1. Verify we are on Landing Page
    expect(screen.getByRole('heading', { name: /Gamify Your Stream/i })).toBeInTheDocument()

    // 2. Click "Connect with Twitch"
    const connectButtons = screen.getAllByText(/Connect with Twitch/i)
    fireEvent.click(connectButtons[0])

    // 3. Verify Landing Page content disappears or Dashboard content appears
    // The Dashboard hook has a 500ms delay for loading
    await waitFor(
      () => {
        expect(
          screen.queryByRole('heading', { name: /Gamify Your Stream/i })
        ).not.toBeInTheDocument()
      },
      { timeout: 2000 }
    )

    // 4. Verify Dashboard generic loading or content
    // Initially it might show "Loading..."
    if (screen.queryByText('Loading...')) {
      await waitFor(
        () => {
          expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument()
        },
        { timeout: 2000 }
      )
    } else {
      expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument()
    }
  })

  it('should render Dashboard statistics after loading', async () => {
    // Navigate first
    render(<App />)
    const connectButtons = screen.getAllByText(/Connect with Twitch/i)
    fireEvent.click(connectButtons[0])

    // Wait for Dashboard
    await waitFor(
      () => {
        expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument()
      },
      { timeout: 2000 }
    )

    // Wait for stats (mock data)
    await waitFor(
      () => {
        expect(screen.getByText('Active Achievements')).toBeInTheDocument()
        expect(screen.getByText('Active Users')).toBeInTheDocument()
      },
      { timeout: 2000 }
    )
  })
})
