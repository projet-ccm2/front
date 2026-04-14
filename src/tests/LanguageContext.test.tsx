import { describe, it, expect, beforeEach } from 'vitest'
import { act, renderHook } from './utils/test-utils'
import { renderHook as renderHookWithoutProviders } from '@testing-library/react'
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

  it('should restore the saved language from localStorage', () => {
    localStorage.setItem('stream-quest_language', 'en')

    const { result } = renderHook(() => useLanguage())

    expect(result.current.language).toBe('en')
    expect(result.current.t('landing.connect')).toBe('Connect with Twitch')
  })

  it('should throw when used outside of the provider', () => {
    const render = () => renderHookWithoutProviders(() => useLanguage())

    expect(render).toThrow('useLanguage must be used within a LanguageProvider')
  })
})
