import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { isIdTokenExpired, getStoredIdToken } from '../../utils/auth'

function makeJwt(exp: number): string {
  const payload = btoa(JSON.stringify({ exp }))
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replaceAll('=', '')
  return `header.${payload}.sig`
}

const now = () => Math.floor(Date.now() / 1000)

describe('isIdTokenExpired', () => {
  it('should return false for a token expiring in the future', () => {
    expect(isIdTokenExpired(makeJwt(now() + 3600))).toBe(false)
  })

  it('should return true for an already expired token', () => {
    expect(isIdTokenExpired(makeJwt(now() - 1))).toBe(true)
  })

  it('should return false when the token has no exp claim', () => {
    const payload = btoa(JSON.stringify({ sub: 'user' }))
    expect(isIdTokenExpired(`header.${payload}.sig`)).toBe(false)
  })

  it('should return false for a malformed token', () => {
    expect(isIdTokenExpired('not-a-jwt')).toBe(false)
  })
})

describe('getStoredIdToken', () => {
  beforeEach(() => localStorage.clear())
  afterEach(() => localStorage.clear())

  it('should return the idToken when present', () => {
    localStorage.setItem('twitch_tokens', JSON.stringify({ idToken: 'my-id-token' }))
    expect(getStoredIdToken()).toBe('my-id-token')
  })

  it('should return null when twitch_tokens is absent', () => {
    expect(getStoredIdToken()).toBeNull()
  })

  it('should return null when twitch_tokens has no idToken field', () => {
    localStorage.setItem('twitch_tokens', JSON.stringify({ accessToken: 'acc' }))
    expect(getStoredIdToken()).toBeNull()
  })

  it('should return null when twitch_tokens is invalid JSON', () => {
    localStorage.setItem('twitch_tokens', 'bad-json')
    expect(getStoredIdToken()).toBeNull()
  })
})
