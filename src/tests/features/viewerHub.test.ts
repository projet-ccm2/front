import { describe, expect, it } from 'vitest'
import { buildViewerChannelSummaries } from '../../features/viewer/utils/viewerHub'

describe('buildViewerChannelSummaries', () => {
  it('groups achievements by channel and keeps the sort stable on ties', () => {
    const summaries = buildViewerChannelSummaries([
      {
        id: 'ach-1',
        title: 'Alpha',
        description: 'desc',
        goal: 1,
        reward: 50,
        label: '',
        public: true,
        downloads: 0,
        visits: 0,
        active: true,
        secret: false,
        image: null,
        channelId: 'channel-b',
        type: { label: 'message', data: null },
        userState: { progressCount: 1, finished: true, acquiredDate: new Date().toISOString() },
      },
      {
        id: 'ach-2',
        title: 'Beta',
        description: 'desc',
        goal: 1,
        reward: 50,
        label: '',
        public: true,
        downloads: 0,
        visits: 0,
        active: true,
        secret: true,
        image: null,
        channelId: '   ',
        type: { label: 'message', data: null },
        userState: { progressCount: 1, finished: false, acquiredDate: null },
      },
      {
        id: 'ach-3',
        title: 'Gamma',
        description: 'desc',
        goal: 1,
        reward: 50,
        label: '',
        public: true,
        downloads: 0,
        visits: 0,
        active: true,
        secret: false,
        image: null,
        channelId: 'channel-a',
        type: { label: 'message', data: null },
        userState: { progressCount: 1, finished: true, acquiredDate: new Date().toISOString() },
      },
    ])

    expect(summaries).toHaveLength(3)
    expect(summaries[0].channelId).toBe('channel-a')
    expect(summaries[1].channelId).toBe('channel-b')
    expect(summaries[2].channelId).toBe('unknown')
    expect(summaries[2].hiddenAchievements).toBe(1)
    expect(summaries[2].inProgressAchievements).toBe(1)
  })

  it('prefers the channel with the highest xp when unlocked counts tie', () => {
    const summaries = buildViewerChannelSummaries([
      {
        id: 'ach-1',
        title: 'Alpha',
        description: 'desc',
        goal: 1,
        reward: 50,
        label: '',
        public: true,
        downloads: 0,
        visits: 0,
        active: true,
        secret: false,
        image: null,
        channelId: 'channel-a',
        type: { label: 'message', data: null },
        userState: { progressCount: 1, finished: true, acquiredDate: new Date().toISOString() },
      },
      {
        id: 'ach-2',
        title: 'Beta',
        description: 'desc',
        goal: 1,
        reward: 100,
        label: '',
        public: true,
        downloads: 0,
        visits: 0,
        active: true,
        secret: false,
        image: null,
        channelId: 'channel-b',
        type: { label: 'message', data: null },
        userState: { progressCount: 1, finished: true, acquiredDate: new Date().toISOString() },
      },
    ])

    expect(summaries[0].channelId).toBe('channel-b')
    expect(summaries[1].channelId).toBe('channel-a')
  })

  it('uses total achievements as a tie-breaker when unlocked and xp are equal', () => {
    const summaries = buildViewerChannelSummaries([
      {
        id: 'ach-1',
        title: 'Alpha',
        description: 'desc',
        goal: 1,
        reward: 50,
        label: '',
        public: true,
        downloads: 0,
        visits: 0,
        active: true,
        secret: false,
        image: null,
        channelId: 'channel-a',
        type: { label: 'message', data: null },
        userState: { progressCount: 1, finished: true, acquiredDate: new Date().toISOString() },
      },
      {
        id: 'ach-2',
        title: 'Beta',
        description: 'desc',
        goal: 1,
        reward: 50,
        label: '',
        public: true,
        downloads: 0,
        visits: 0,
        active: true,
        secret: false,
        image: null,
        channelId: 'channel-b',
        type: { label: 'message', data: null },
        userState: { progressCount: 1, finished: true, acquiredDate: new Date().toISOString() },
      },
      {
        id: 'ach-3',
        title: 'Gamma',
        description: 'desc',
        goal: 1,
        reward: 0,
        label: '',
        public: true,
        downloads: 0,
        visits: 0,
        active: true,
        secret: false,
        image: null,
        channelId: 'channel-b',
        type: { label: 'message', data: null },
        userState: { progressCount: 1, finished: false, acquiredDate: null },
      },
    ])

    expect(summaries[0].channelId).toBe('channel-b')
    expect(summaries[0].totalAchievements).toBe(2)
    expect(summaries[1].channelId).toBe('channel-a')
    expect(summaries[1].totalAchievements).toBe(1)
  })
})
