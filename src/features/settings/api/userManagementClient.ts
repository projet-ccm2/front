import { AUTH_SERVICE_URL } from '../../../config/environment'

export class UserManagementError extends Error {
  readonly status: number
  readonly details?: unknown

  constructor(message: string, status: number, details?: unknown) {
    super(message)
    this.name = 'UserManagementError'
    this.status = status
    this.details = details
  }
}

export const userManagementClient = {
  async deleteAccount(accessToken: string): Promise<void> {
    const response = await fetch(`${AUTH_SERVICE_URL}/auth/delete-account`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      let details: unknown = null
      try {
        details = await response.json()
      } catch {
        details = await response.text()
      }
      throw new UserManagementError(
        `Delete account failed with status ${response.status}`,
        response.status,
        details
      )
    }
  },
}
