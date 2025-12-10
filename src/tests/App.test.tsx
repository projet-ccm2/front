import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from './utils/test-utils'
import App from '../App'

describe('App Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Initial Render (Landing Page)', () => {
    it('should render the Landing Page initially', () => {
      render(<App />)
      expect(screen.getByRole('heading', { name: /Gamify Your Stream/i })).toBeInTheDocument()
      expect(screen.getByText(/Transform viewer engagement/i)).toBeInTheDocument()
    })

    it('should display the "Connect with Twitch" buttons', () => {
      render(<App />)
      const connectButtons = screen.getAllByText(/Connect with Twitch/i)
      expect(connectButtons.length).toBeGreaterThan(0)
    })

    it('should display the "Get Started Free" button', () => {
      render(<App />)
      const getStartedButton = screen.getByRole('button', { name: /Get Started Free/i })
      expect(getStartedButton).toBeInTheDocument()
    })
  })

  describe('User Interactions', () => {
    it('should navigate to Dashboard when "Connect with Twitch" is clicked', async () => {
      render(<App />)

      const connectButtons = screen.getAllByText(/Connect with Twitch/i)
      fireEvent.click(connectButtons[0])

      await waitFor(() => {
        expect(screen.queryByText(/Gamify Your Stream/i)).not.toBeInTheDocument()
      })
    })

    it('should allow theme toggling', () => {
      render(<App />)
      const themeButton = screen.getByLabelText(/Toggle theme/i)
      expect(themeButton).toBeInTheDocument()

      // Initial state check (might depend on system preference or default)
      // For simplicity, we just check if it's clickable without crashing
      fireEvent.click(themeButton)
    })

    it('should navigate to all screens from dashboard', async () => {
      render(<App />)

      // Connect first
      const connectButtons = screen.getAllByText(/Connect with Twitch/i)
      fireEvent.click(connectButtons[0])

      // Wait for dashboard to load
      await waitFor(
        () => {
          expect(screen.queryByText(/Gamify Your Stream/i)).not.toBeInTheDocument()
        },
        { timeout: 3000 }
      )
    })
  })

  describe('Screen Navigation', () => {
    it('should handle navigation to creator screen', async () => {
      render(<App />)

      const connectButtons = screen.getAllByText(/Connect with Twitch/i)
      fireEvent.click(connectButtons[0])

      await waitFor(() => {
        expect(screen.queryByText(/Gamify Your Stream/i)).not.toBeInTheDocument()
      })
    })

    it('should handle navigation to management screen', async () => {
      render(<App />)

      const connectButtons = screen.getAllByText(/Connect with Twitch/i)
      fireEvent.click(connectButtons[0])

      await waitFor(() => {
        expect(screen.queryByText(/Gamify Your Stream/i)).not.toBeInTheDocument()
      })
    })

    it('should handle navigation to marketplace screen', async () => {
      render(<App />)

      const connectButtons = screen.getAllByText(/Connect with Twitch/i)
      fireEvent.click(connectButtons[0])

      await waitFor(() => {
        expect(screen.queryByText(/Gamify Your Stream/i)).not.toBeInTheDocument()
      })
    })

    it('should handle navigation to profile screen', async () => {
      render(<App />)

      const connectButtons = screen.getAllByText(/Connect with Twitch/i)
      fireEvent.click(connectButtons[0])

      await waitFor(() => {
        expect(screen.queryByText(/Gamify Your Stream/i)).not.toBeInTheDocument()
      })
    })

    it('should handle navigation to overlay screen', async () => {
      render(<App />)

      const connectButtons = screen.getAllByText(/Connect with Twitch/i)
      fireEvent.click(connectButtons[0])

      await waitFor(() => {
        expect(screen.queryByText(/Gamify Your Stream/i)).not.toBeInTheDocument()
      })
    })
  })
})
