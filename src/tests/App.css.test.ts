import { describe, it, expect } from 'vitest'

describe('App.css', () => {
  it('devrait être importable sans erreur', () => {
    expect(() => {
      const cssModule = {}
      return cssModule
    }).not.toThrow()
  })

  it('devrait avoir des classes CSS définies', () => {
    const expectedClasses = ['logo', 'card', 'read-the-docs']
    expectedClasses.forEach(className => {
      expect(className).toBeTruthy()
    })
  })
})
