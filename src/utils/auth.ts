export function isIdTokenExpired(idToken: string): boolean {
  try {
    const payload = idToken.split('.')[1]
    const decoded = JSON.parse(atob(payload.replaceAll('-', '+').replaceAll('_', '/'))) as {
      exp?: number
    }
    if (typeof decoded.exp !== 'number') return false
    return decoded.exp < Math.floor(Date.now() / 1000)
  } catch {
    return false
  }
}

export function getStoredIdToken(): string | null {
  try {
    const raw = localStorage.getItem('twitch_tokens')
    if (!raw) return null
    return (JSON.parse(raw) as { idToken: string }).idToken ?? null
  } catch {
    return null
  }
}
