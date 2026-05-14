import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  userManagementClient,
  UserManagementError,
} from '../../../features/settings/api/userManagementClient'
import type { DeleteAccountTokens } from '../../../features/settings/api/userManagementClient'

const validTokens: DeleteAccountTokens = {
  accessToken: 'access-abc',
  idToken: 'id-token-xyz',
  tokenType: 'bearer',
  expiresIn: 3600,
  scope: [],
}

describe('userManagementClient.deleteAccount', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('resolves without throwing on 204', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 204,
    } as Response)

    await expect(userManagementClient.deleteAccount(validTokens)).resolves.toBeUndefined()
  })

  it('sends a POST to /auth/delete-account with JSON body containing both tokens', async () => {
    vi.mocked(fetch).mockResolvedValue({ ok: true, status: 204 } as Response)

    await userManagementClient.deleteAccount(validTokens)

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/auth/delete-account'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(validTokens),
      })
    )
  })

  it('throws UserManagementError with status and JSON details on 4xx', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 401,
      json: () => Promise.resolve({ message: 'Unauthorized' }),
    } as Response)

    await expect(userManagementClient.deleteAccount(validTokens)).rejects.toThrow(
      UserManagementError
    )

    await userManagementClient.deleteAccount(validTokens).catch((err: UserManagementError) => {
      expect(err.status).toBe(401)
      expect(err.details).toEqual({ message: 'Unauthorized' })
    })
  })

  it('throws UserManagementError with status 400 for bad request', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ message: 'Bad Request' }),
    } as Response)

    await userManagementClient.deleteAccount(validTokens).catch((err: UserManagementError) => {
      expect(err).toBeInstanceOf(UserManagementError)
      expect(err.status).toBe(400)
    })
  })

  it('falls back to text() when json() throws on error response', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 500,
      json: () => {
        throw new Error('not json')
      },
      text: () => Promise.resolve('Internal Server Error'),
    } as unknown as Response)

    await userManagementClient.deleteAccount(validTokens).catch((err: UserManagementError) => {
      expect(err).toBeInstanceOf(UserManagementError)
      expect(err.status).toBe(500)
      expect(err.details).toBe('Internal Server Error')
    })
  })
})
