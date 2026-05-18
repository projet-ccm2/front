import { useState, useCallback } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { userManagementClient } from '../api/userManagementClient'
import type { DeleteAccountTokens } from '../api/userManagementClient'

function clearAllCookies() {
  document.cookie.split(';').forEach(cookie => {
    const name = cookie.split('=')[0].trim()
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`
  })
}

export function useNukeAccount() {
  const { logout } = useAuth()
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const nuke = useCallback(
    async (tokens: DeleteAccountTokens, onSuccess: () => void) => {
      setIsDeleting(true)
      setError(null)
      try {
        await userManagementClient.deleteAccount(tokens)
        logout()
        sessionStorage.clear()
        clearAllCookies()
        onSuccess()
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        setError(message)
        throw err
      } finally {
        setIsDeleting(false)
      }
    },
    [logout]
  )

  const resetError = useCallback(() => setError(null), [])

  return { nuke, isDeleting, error, resetError }
}
