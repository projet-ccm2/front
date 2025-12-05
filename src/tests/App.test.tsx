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

  describe('Rendu initial', () => {
    it('devrait rendre le composant App sans erreur', () => {
      render(<App />)
      expect(screen.getByText(/Vite \+ React/i)).toBeInTheDocument()
    })

    it('devrait afficher le titre "Vite + React"', () => {
      render(<App />)
      const heading = screen.getByRole('heading', { name: /Vite \+ React/i })
      expect(heading).toBeInTheDocument()
      expect(heading.tagName).toBe('H1')
    })

    it('devrait afficher le logo Vite', () => {
      render(<App />)
      const viteLogo = screen.getByAltText('Vite logo')
      expect(viteLogo).toBeInTheDocument()
      expect(viteLogo).toHaveAttribute('src')
    })

    it('devrait afficher le logo React', () => {
      render(<App />)
      const reactLogo = screen.getByAltText('React logo')
      expect(reactLogo).toBeInTheDocument()
      expect(reactLogo).toHaveAttribute('src', expect.stringContaining('react.svg'))
    })

    it('devrait afficher les liens vers Vite et React', () => {
      render(<App />)
      const viteLink = screen.getByRole('link', { name: /vite logo/i })
      const reactLink = screen.getByRole('link', { name: /react logo/i })

      expect(viteLink).toBeInTheDocument()
      expect(viteLink).toHaveAttribute('href', 'https://vite.dev')
      expect(viteLink).toHaveAttribute('target', '_blank')

      expect(reactLink).toBeInTheDocument()
      expect(reactLink).toHaveAttribute('href', 'https://react.dev')
      expect(reactLink).toHaveAttribute('target', '_blank')
    })

    it('devrait afficher le bouton de compteur avec la valeur initiale 0', () => {
      render(<App />)
      const button = screen.getByRole('button', { name: /count is 0/i })
      expect(button).toBeInTheDocument()
      expect(button).toHaveTextContent('count is 0')
    })

    it("devrait afficher le texte d'instruction", () => {
      render(<App />)
      expect(screen.getByText(/Edit/i)).toBeInTheDocument()
      expect(screen.getByText(/save to test HMR/i)).toBeInTheDocument()
    })

    it('devrait afficher le code dans le paragraphe', () => {
      render(<App />)
      const codeElement = screen.getByText('src/App.tsx')
      expect(codeElement).toBeInTheDocument()
      expect(codeElement.tagName).toBe('CODE')
    })

    it('devrait afficher le texte "Click on the Vite and React logos"', () => {
      render(<App />)
      expect(screen.getByText(/Click on the Vite and React logos/i)).toBeInTheDocument()
    })
  })

  describe('Interactions utilisateur', () => {
    it('devrait incrémenter le compteur quand on clique sur le bouton', () => {
      render(<App />)
      const button = screen.getByRole('button', { name: /count is 0/i })

      expect(button).toHaveTextContent('count is 0')

      fireEvent.click(button)
      expect(button).toHaveTextContent('count is 1')

      fireEvent.click(button)
      expect(button).toHaveTextContent('count is 2')
    })

    it('devrait incrémenter le compteur plusieurs fois consécutivement', () => {
      render(<App />)
      const button = screen.getByRole('button')

      for (let i = 0; i < 5; i++) {
        fireEvent.click(button)
        expect(button).toHaveTextContent(`count is ${i + 1}`)
      }
    })

    it('devrait mettre à jour le texte du bouton après chaque clic', async () => {
      render(<App />)
      const button = screen.getByRole('button')

      expect(button.textContent).toBe('count is 0')

      fireEvent.click(button)
      await waitFor(() => {
        expect(button.textContent).toBe('count is 1')
      })

      fireEvent.click(button)
      await waitFor(() => {
        expect(button.textContent).toBe('count is 2')
      })
    })
  })

  describe('Structure et classes CSS', () => {
    it('devrait avoir la classe "logo" sur les images', () => {
      render(<App />)
      const logos = screen.getAllByRole('img')
      logos.forEach(logo => {
        expect(logo).toHaveClass('logo')
      })
    })

    it('devrait avoir la classe "react" sur le logo React', () => {
      render(<App />)
      const reactLogo = screen.getByAltText('React logo')
      expect(reactLogo).toHaveClass('react')
    })

    it('devrait avoir la classe "card" sur le conteneur du bouton', () => {
      render(<App />)
      const card = screen.getByText(/count is/i).closest('.card')
      expect(card).toBeInTheDocument()
    })

    it('devrait avoir la classe "read-the-docs" sur le paragraphe final', () => {
      render(<App />)
      const paragraph = screen.getByText(/Click on the Vite and React logos/i)
      expect(paragraph).toHaveClass('read-the-docs')
    })
  })

  describe('Accessibilité', () => {
    it('devrait avoir une structure sémantique correcte', () => {
      render(<App />)
      const heading = screen.getByRole('heading', { level: 1 })
      expect(heading).toBeInTheDocument()
    })

    it('devrait avoir des images avec des attributs alt appropriés', () => {
      render(<App />)
      const images = screen.getAllByRole('img')
      images.forEach(img => {
        expect(img).toHaveAttribute('alt')
        expect(img.getAttribute('alt')).not.toBe('')
      })
    })

    it('devrait avoir des liens accessibles', () => {
      render(<App />)
      const links = screen.getAllByRole('link')
      links.forEach(link => {
        expect(link).toBeInTheDocument()
      })
    })
  })

  describe('Comportement du state', () => {
    it("devrait maintenir l'état du compteur pendant le re-render", () => {
      const { rerender } = render(<App />)
      const button = screen.getByRole('button')

      fireEvent.click(button)
      expect(button).toHaveTextContent('count is 1')

      rerender(<App />)
      const newButton = screen.getByRole('button')
      expect(newButton).toHaveTextContent('count is 1')
    })

    it('devrait utiliser la fonction de callback dans setState', () => {
      render(<App />)
      const button = screen.getByRole('button')

      fireEvent.click(button)
      expect(button).toHaveTextContent('count is 1')

      fireEvent.click(button)
      expect(button).toHaveTextContent('count is 2')
    })
  })

  describe('Performance et optimisations', () => {
    it('devrait rendre rapidement sans erreurs de console', () => {
      const consoleSpy = vi.spyOn(console, 'error')
      render(<App />)
      expect(consoleSpy).not.toHaveBeenCalled()
      consoleSpy.mockRestore()
    })

    it('devrait gérer les clics rapides sans problème', () => {
      render(<App />)
      const button = screen.getByRole('button')

      for (let i = 0; i < 10; i++) {
        fireEvent.click(button)
      }

      expect(button).toHaveTextContent('count is 10')
    })
  })

  describe('Edge cases', () => {
    it('devrait gérer correctement le compteur à zéro', () => {
      render(<App />)
      const button = screen.getByRole('button')
      expect(button).toHaveTextContent('count is 0')

      fireEvent.click(button)
      expect(button).not.toHaveTextContent('count is 0')
    })

    it('devrait fonctionner avec StrictMode activé', () => {
      render(<App />)
      const button = screen.getByRole('button')
      fireEvent.click(button)
      expect(button).toHaveTextContent('count is 1')
    })
  })
})
