import { describe, it, expect, beforeEach } from 'vitest'
import { act, renderHook } from './utils/test-utils'
import { useLanguage } from '../context/LanguageContext'

describe('LanguageContext', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should default to English', () => {
    const { result } = renderHook(() => useLanguage())

    expect(result.current.language).toBe('fr')
    expect(result.current.t('landing.connect')).toBe('Se connecter avec Twitch')
  })

  it('should toggle to French and persist the choice', async () => {
    const { result } = renderHook(() => useLanguage())

    act(() => {
      result.current.toggleLanguage()
    })

    expect(result.current.language).toBe('en')
    expect(result.current.t('landing.connect')).toBe('Connect with Twitch')
    expect(localStorage.getItem('stream-quest_language')).toBe('en')
  })
})
