import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  bucketManagerClient,
  BucketManagerError,
} from '../../features/achievements/api/bucketManagerClient'

describe('bucketManagerClient', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('should upload an achievement image through the bucket manager', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          success: true,
          key: 'assets/image/achievement/achievement-1.webp',
          message: 'Image uploaded successfully',
          timestamp: '2026-04-15T10:00:00.000Z',
        }),
    } as Response)

    const result = await bucketManagerClient.uploadAchievementImage(
      new File(['bytes'], 'achievement.png', { type: 'image/png' }),
      'achievement-1'
    )

    expect(result).toBe('assets/image/achievement/achievement-1.webp')
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/bucket/image/insert'),
      expect.objectContaining({
        method: 'POST',
        body: expect.any(FormData),
      })
    )

    const [, init] = vi.mocked(fetch).mock.calls[0]
    const formData = init?.body as FormData

    expect(formData.get('typeImage')).toBe('achievement')
    expect(formData.get('elementId')).toBe('achievement-1')
    expect(formData.get('image')).toBeInstanceOf(File)
  })

  it('should surface bucket manager error details', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 502,
      json: () => Promise.resolve({ message: 'bad gateway' }),
    } as Response)

    await expect(
      bucketManagerClient.uploadAchievementImage(
        new File(['bytes'], 'achievement.png', { type: 'image/png' }),
        'achievement-1'
      )
    ).rejects.toMatchObject({
      name: 'BucketManagerError',
      status: 502,
      details: { message: 'bad gateway' },
    } satisfies Partial<BucketManagerError>)
  })
})
