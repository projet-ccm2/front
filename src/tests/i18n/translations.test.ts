import { describe, it, expect } from 'vitest'
import { resolveTranslation } from '../../i18n/translations'

describe('translations', () => {
  it('should resolve known translations for both languages', () => {
    expect(resolveTranslation('fr', 'landing.connect')).toBe('Se connecter avec Twitch')
    expect(resolveTranslation('en', 'landing.connect')).toBe('Connect with Twitch')
  })

  it('should interpolate params when provided', () => {
    expect(resolveTranslation('fr', 'landing.heroDescription', { count: 3 })).toBe(
      "Transformez l'engagement des viewers avec des succès, des quêtes et des récompenses. Gardez votre communauté active avec Stream Quest."
    )
  })

  it('should fall back to the key when translation is missing', () => {
    expect(resolveTranslation('fr', 'missing.key')).toBe('missing.key')
  })
})
