import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  userManagementClient,
  UserManagementError,
} from '../../../features/settings/api/userManagementClient'

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

    await expect(userManagementClient.deleteAccount('token-abc')).resolves.toBeUndefined()
  })

  it('sends a POST to /auth/delete-account with Authorization header', async () => {
    vi.mocked(fetch).mockResolvedValue({ ok: true, status: 204 } as Response)

    await userManagementClient.deleteAccount('my-token')

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/auth/delete-account'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ Authorization: 'Bearer my-token' }),
      })
    )
  })

  it('throws UserManagementError with status and JSON details on 4xx', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 401,
      json: () => Promise.resolve({ message: 'Unauthorized' }),
    } as Response)

    await expect(userManagementClient.deleteAccount('bad-token')).rejects.toThrow(
      UserManagementError
    )

    await userManagementClient.deleteAccount('bad-token').catch((err: UserManagementError) => {
      expect(err.status).toBe(401)
      expect(err.details).toEqual({ message: 'Unauthorized' })
    })
  })

  it('throws UserManagementError with status 403 for forbidden', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 403,
      json: () => Promise.resolve({ message: 'Forbidden' }),
    } as Response)

    await userManagementClient.deleteAccount('token').catch((err: UserManagementError) => {
      expect(err).toBeInstanceOf(UserManagementError)
      expect(err.status).toBe(403)
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

    await userManagementClient.deleteAccount('token').catch((err: UserManagementError) => {
      expect(err).toBeInstanceOf(UserManagementError)
      expect(err.status).toBe(500)
      expect(err.details).toBe('Internal Server Error')
    })
  })
})
