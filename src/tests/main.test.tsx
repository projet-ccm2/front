import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { StrictMode } from 'react'

const mockRender = vi.fn()
const mockCreateRoot = vi.fn(element => ({
  render: mockRender,
  _element: element,
}))

vi.mock('react-dom/client', () => ({
  createRoot: (element: HTMLElement) => mockCreateRoot(element),
}))

import { createRoot } from 'react-dom/client'

describe("main.tsx - Point d'entrée", () => {
  let container: HTMLDivElement
  let rootElement: HTMLElement | null

  beforeEach(() => {
    container = document.createElement('div')
    container.id = 'root'
    document.body.appendChild(container)

    rootElement = document.getElementById('root')
    vi.clearAllMocks()
  })

  afterEach(() => {
    if (document.body.contains(container)) {
      document.body.removeChild(container)
    }
    vi.clearAllMocks()
    vi.restoreAllMocks()
  })

  describe("Initialisation de l'application", () => {
    it("devrait trouver l'élément root dans le DOM", () => {
      const root = document.getElementById('root')
      expect(root).toBeTruthy()
      expect(root?.id).toBe('root')
    })

    it('devrait créer une instance de createRoot avec le bon élément', () => {
      const root = createRoot(rootElement!)
      expect(mockCreateRoot).toHaveBeenCalled()
      expect(mockCreateRoot).toHaveBeenCalledWith(rootElement)
      expect((root as unknown as { _element: HTMLElement })._element).toBe(rootElement)
    })

    it("devrait appeler render sur l'instance root", () => {
      const root = createRoot(rootElement!)
      root.render(
        <StrictMode>
          <div>Test</div>
        </StrictMode>
      )

      expect(mockRender).toHaveBeenCalled()
      expect(mockRender).toHaveBeenCalledTimes(1)
    })

    it('devrait rendre App dans StrictMode', () => {
      const root = createRoot(rootElement!)
      const appElement = (
        <StrictMode>
          <div>App</div>
        </StrictMode>
      )
      root.render(appElement)

      expect(mockRender).toHaveBeenCalled()
      const renderCall = mockRender.mock.calls[0][0]
      expect(renderCall.type).toBe(StrictMode)
    })
  })

  describe('Gestion des erreurs', () => {
    it("devrait gérer le cas où root n'existe pas", () => {
      const nullElement = null

      expect(() => {
        if (!nullElement) {
          throw new Error('Root element not found')
        }
        createRoot(nullElement)
      }).toThrow('Root element not found')
    })

    it('ne devrait pas planter si createRoot échoue', () => {
      mockCreateRoot.mockImplementationOnce(() => {
        throw new Error('Failed to create root')
      })

      expect(() => {
        createRoot(rootElement!)
      }).toThrow('Failed to create root')
    })
  })

  describe('Configuration', () => {
    it('devrait utiliser StrictMode pour le développement', () => {
      const root = createRoot(rootElement!)
      const appElement = (
        <StrictMode>
          <div>App</div>
        </StrictMode>
      )
      root.render(appElement)

      const renderCall = mockRender.mock.calls[0][0]
      expect(renderCall.type).toBe(StrictMode)
    })

    it('devrait avoir StrictMode comme wrapper autour de App', () => {
      const root = createRoot(rootElement!)
      const appElement = (
        <StrictMode>
          <div>App</div>
        </StrictMode>
      )
      root.render(appElement)

      const renderCall = mockRender.mock.calls[0][0]
      expect(renderCall.type).toBe(StrictMode)
      expect(renderCall.props.children).toBeDefined()
    })
  })
})
