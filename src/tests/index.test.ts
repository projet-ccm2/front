import { beforeEach, describe, expect, it } from 'vitest'

beforeEach(() => {
  window.history.pushState({}, '', '/')
  localStorage.clear()
})

describe('Imports de modules', () => {
  it('devrait pouvoir importer App sans erreur', async () => {
    await expect(import('../App')).resolves.toBeDefined()
  }, 20000)

  it('devrait pouvoir importer le point d’entrée sans erreur', async () => {
    const root = document.createElement('div')
    root.id = 'root'
    document.body.appendChild(root)

    await expect(import('../main')).resolves.toBeDefined()
  })

  it('devrait exporter App comme export par défaut', async () => {
    const appModule = await import('../App')
    expect(appModule.default).toBeDefined()
    expect(typeof appModule.default).toBe('function')
  })
})
