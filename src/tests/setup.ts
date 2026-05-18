import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

// Node 26 exposes an experimental Web Storage getter on globalThis that returns
// undefined (requires --localstorage-file). Override it with an in-memory store
// so jsdom tests can use localStorage normally.
const _lsDesc = Object.getOwnPropertyDescriptor(globalThis, 'localStorage')
if (!_lsDesc?.value || typeof (_lsDesc.value as Record<string, unknown>).setItem !== 'function') {
  let _store: Record<string, string> = {}
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    writable: true,
    value: {
      getItem: (key: string) => _store[key] ?? null,
      setItem: (key: string, value: string) => {
        _store[key] = String(value)
      },
      removeItem: (key: string) => {
        delete _store[key]
      },
      clear: () => {
        _store = {}
      },
      get length() {
        return Object.keys(_store).length
      },
      key: (index: number) => Object.keys(_store)[index] ?? null,
    },
  })
}

// Default to French so all tests that check UI text work with the same locale
Object.defineProperty(navigator, 'language', { value: 'fr', configurable: true })

afterEach(() => {
  localStorage.clear()
  cleanup()
})

Object.defineProperty(globalThis, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

globalThis.ResizeObserver = class ResizeObserver {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
}
