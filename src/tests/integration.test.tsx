import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from './utils/test-utils'
import App from '../App'

describe("Tests d'intégration", () => {
  it("devrait rendre l'application complète sans erreur", () => {
    render(<App />)

    expect(screen.getByRole('heading', { name: /Vite \+ React/i })).toBeInTheDocument()
    expect(screen.getByRole('button')).toBeInTheDocument()
    expect(screen.getAllByRole('img')).toHaveLength(2)
  })

  it("devrait permettre l'interaction complète avec l'application", () => {
    const { container } = render(<App />)

    expect(container.querySelector('h1')).toBeInTheDocument()
    expect(container.querySelector('.card')).toBeInTheDocument()
    expect(container.querySelectorAll('a')).toHaveLength(2)
  })

  it('devrait maintenir la cohérence du DOM après les interactions', () => {
    render(<App />)

    const button = screen.getByRole('button')
    const heading = screen.getByRole('heading')

    fireEvent.click(button)

    expect(heading).toBeInTheDocument()
    expect(button).toBeInTheDocument()
  })
})
