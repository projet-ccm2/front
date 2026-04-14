import { describe, it, expect } from 'vitest'
import {
  buildPublicPanelUrl,
  getPublicPanelChannelId,
  getPublicPanelViewerId,
  isPublicPanelPath,
} from '../../features/overlay/utils/publicPanelLink'

describe('publicPanelLink', () => {
  it('detects and parses a public panel route', () => {
    expect(isPublicPanelPath('/panel/channel-1')).toBe(true)
    expect(getPublicPanelChannelId('/panel/channel-1')).toBe('channel-1')
  })

  it('returns null for invalid public panel routes', () => {
    expect(isPublicPanelPath('/dashboard')).toBe(false)
    expect(getPublicPanelChannelId('/dashboard')).toBeNull()
  })

  it('builds a shareable public panel URL', () => {
    expect(buildPublicPanelUrl('channel-1', 'https://example.com/')).toBe(
      'https://example.com/panel/channel-1'
    )
  })

  it('parses the viewer id from the query string', () => {
    expect(getPublicPanelViewerId('?viewerId=viewer-1')).toBe('viewer-1')
    expect(getPublicPanelViewerId('?viewerId=   ')).toBeNull()
  })
})
