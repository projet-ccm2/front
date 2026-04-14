import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import App from '../App'
import React from 'react'

describe('App Component', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
    vi.stubGlobal('fetch', vi.fn())
  })

  describe('Initial Render', () => {
    it('should render the Landing Page initially', () => {
      render(<App />)
      expect(screen.getAllByText(/Gamifiez votre stream/i).length).toBeGreaterThan(0)
      expect(screen.getAllByText(/Transformez l'engagement des viewers/i).length).toBeGreaterThan(0)
    })

    it('should display the connect buttons', () => {
      render(<App />)
      const connectButtons = screen.getAllByText(/Se connecter avec Twitch/i)
      expect(connectButtons.length).toBeGreaterThan(0)
    })
  })

  describe('Authenticated State', () => {
    it('should process authenticated state from localStorage', async () => {
      const mockUser = {
        userId: '123456',
        username: 'testuser',
        channel: {
          id: '123',
          name: 'Test',
          description: '',
          profileImageUrl: '',
        },
        channelsWhichIsMod: [],
      }
      localStorage.setItem('twitch_user', JSON.stringify(mockUser))

      render(<App />)

      await waitFor(
        () => {
          expect(screen.getAllByText(/Gérer les succès/i).length).toBeGreaterThan(0)
        },
        { timeout: 5000 }
      )
    })

    it('should handle navigation between screens', async () => {
      const mockUser = {
        userId: '123456',
        username: 'testuser',
        channel: { id: '123', name: 'Test', description: '', profileImageUrl: '' },
        channelsWhichIsMod: [],
      }
      localStorage.setItem('twitch_user', JSON.stringify(mockUser))

      render(<App />)

      await waitFor(() => {
        expect(screen.getAllByText(/Tableau de bord/i).length).toBeGreaterThan(0)
      })

      const creatorButtons = screen.getAllByText(/Créer un succès/i)
      creatorButtons[0].click()

      await waitFor(() => {
        expect(screen.getAllByText(/Design a new quest/i).length).toBeGreaterThan(0)
      })
    })
  })

  describe('Auth Callback Handling', () => {
    it('should process hash parameters and navigate to dashboard', async () => {
      vi.stubGlobal('location', {
        hash: '#access_token=at&id_token=it&token_type=bearer&expires_in=3600&state=st',
        pathname: '/',
      })

      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            user: {
              username: 'testuser',
              channel: { id: '123', name: 'Test', description: '', profileImageUrl: '' },
              channelsWhichIsMod: [],
            },
            userId: '123456',
          }),
      })
      vi.stubGlobal('fetch', mockFetch)

      const replaceStateSpy = vi.fn()
      vi.stubGlobal('history', {
        replaceState: replaceStateSpy,
      })

      render(<App />)

      await waitFor(
        () => {
          expect(screen.getAllByText(/Gérer les succès/i).length).toBeGreaterThan(0)
        },
        { timeout: 5000 }
      )

      expect(replaceStateSpy).toHaveBeenCalled()
      vi.unstubAllGlobals()
    })

    it('should handle missing tokens in hash gracefully', async () => {
      vi.stubGlobal('location', {
        hash: '#access_token=at',
        pathname: '/',
      })

      render(<App />)

      expect(screen.getAllByText(/Gamifiez votre stream/i).length).toBeGreaterThan(0)

      vi.unstubAllGlobals()
    })
  })
})
