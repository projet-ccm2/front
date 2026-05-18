import { describe, expect, it } from 'vitest'
import {
  buildLeaderboardEntries,
  buildPanelAchievementEntries,
  buildPublicPanelEntries,
} from '../../features/achievements/utils/achievementLeaderboard'

const t = (key: string, params?: Record<string, string | number>) => {
  if (key === 'achievements.status.unlocked') {
    return 'Unlocked'
  }

  if (key === 'achievements.status.progress') {
    return `${params?.current}/${params?.goal}`
  }

  if (key === 'achievements.hidden.title') {
    return 'Hidden achievement'
  }

  if (key === 'achievements.hidden.description') {
    return 'Hidden description'
  }

  if (key === 'marketplace.active') {
    return 'Active'
  }

  if (key === 'marketplace.inactive') {
    return 'Inactive'
  }

  return key
}

describe('achievementLeaderboard helpers', () => {
  it('sorts leaderboard entries by reward, completion, progress and title', () => {
    const entries = buildLeaderboardEntries(
      [
        {
          id: 'a',
          title: 'Alpha',
          description: '',
          goal: 10,
          reward: 100,
          label: '',
          public: true,
          downloads: 0,
          visits: 0,
          active: true,
          secret: false,
          image: null,
          channelId: 'channel-1',
          type: { label: 'message', data: null },
          userState: { progressCount: 1, finished: false, acquiredDate: null },
        },
        {
          id: 'b',
          title: 'Bravo',
          description: '',
          goal: 10,
          reward: 100,
          label: 'B',
          public: true,
          downloads: 0,
          visits: 0,
          active: true,
          secret: false,
          image: null,
          channelId: 'channel-1',
          type: { label: 'message', data: null },
          userState: { progressCount: 2, finished: true, acquiredDate: null },
        },
        {
          id: 'c',
          title: 'Charlie',
          description: '',
          goal: 10,
          reward: 150,
          label: 'C',
          public: true,
          downloads: 0,
          visits: 0,
          active: true,
          secret: false,
          image: null,
          channelId: 'channel-1',
          type: { label: 'message', data: null },
          userState: { progressCount: 0, finished: false, acquiredDate: null },
        },
        {
          id: 'd',
          title: 'Delta',
          description: '',
          goal: 10,
          reward: 100,
          label: 'D',
          public: true,
          downloads: 0,
          visits: 0,
          active: true,
          secret: false,
          image: null,
          channelId: 'channel-1',
          type: { label: 'message', data: null },
          userState: { progressCount: 2, finished: false, acquiredDate: null },
        },
      ],
      t
    )

    expect(entries.map(entry => entry.title)).toEqual(['Charlie', 'Bravo', 'Delta', 'Alpha'])
    expect(entries[0].status).toBe('0/10')
    expect(entries[1].status).toBe('Unlocked')
    expect(entries[3].avatar).toBe('A')
  })

  it('hides secret achievements until unlocked in panel entries', () => {
    const entries = buildPanelAchievementEntries(
      [
        {
          id: 'secret',
          title: 'Secret Goal',
          description: 'Reveal me',
          goal: 5,
          reward: 200,
          label: 'S',
          public: true,
          downloads: 0,
          visits: 0,
          active: true,
          secret: true,
          image: null,
          channelId: 'channel-1',
          type: { label: 'message', data: null },
          userState: { progressCount: 0, finished: false, acquiredDate: null },
        },
        {
          id: 'open',
          title: 'Open Goal',
          description: 'Visible',
          goal: 10,
          reward: 50,
          label: '',
          public: true,
          downloads: 0,
          visits: 0,
          active: true,
          secret: false,
          image: null,
          channelId: 'channel-1',
          type: { label: 'message', data: null },
          userState: { progressCount: 3, finished: true, acquiredDate: null },
        },
      ],
      t
    )

    expect(entries[0].isHidden).toBe(true)
    expect(entries[0].title).toBe('Hidden achievement')
    expect(entries[0].description).toBe('Hidden description')
    expect(entries[0].progressText).toBe('0/5')
    expect(entries[1].isUnlocked).toBe(true)
    expect(entries[1].progressText).toBe('Unlocked')
  })

  it('marks public panel entries by visibility and active state', () => {
    const entries = buildPublicPanelEntries(
      [
        {
          id: 'hidden',
          title: 'Hidden Public',
          description: 'Secret',
          goal: 1,
          reward: 10,
          label: '',
          public: true,
          downloads: 0,
          visits: 0,
          active: false,
          secret: true,
          image: null,
          channelId: 'channel-1',
          type: { label: 'message', data: null },
        },
        {
          id: 'public',
          title: 'Public Goal',
          description: 'Visible',
          goal: 1,
          reward: 20,
          label: 'PG',
          public: true,
          downloads: 0,
          visits: 1,
          active: true,
          secret: false,
          image: null,
          channelId: 'channel-1',
          type: { label: 'message', data: null },
        },
      ],
      t
    )

    expect(entries[0].title).toBe('Public Goal')
    expect(entries[0].status).toBe('Active')
    expect(entries[1].title).toBe('Hidden achievement')
    expect(entries[1].status).toBe('Inactive')
    expect(entries[1].isHidden).toBe(true)
  })

  it('uses title fallback sorting and avatar fallback when scores are tied', () => {
    const leaderboardEntries = buildLeaderboardEntries(
      [
        {
          id: 'fallback-b',
          title: 'Beta',
          description: '',
          goal: 10,
          reward: 25,
          label: '',
          public: true,
          downloads: 0,
          visits: 0,
          active: true,
          secret: false,
          image: null,
          channelId: 'channel-1',
          type: { label: 'message', data: null },
          userState: { progressCount: 0, finished: false, acquiredDate: null },
        },
        {
          id: 'fallback-a',
          title: '',
          description: '',
          goal: 10,
          reward: 25,
          label: '',
          public: true,
          downloads: 0,
          visits: 0,
          active: true,
          secret: false,
          image: null,
          channelId: 'channel-1',
          type: { label: 'message', data: null },
          userState: { progressCount: 0, finished: false, acquiredDate: null },
        },
      ],
      t
    )

    expect(leaderboardEntries.map(entry => entry.title)).toEqual(['', 'Beta'])
    expect(leaderboardEntries[0].avatar).toBe('A')

    const publicEntries = buildPublicPanelEntries(
      [
        {
          id: 'public-b',
          title: 'Beta',
          description: '',
          goal: 1,
          reward: 25,
          label: '',
          public: true,
          downloads: 0,
          visits: 0,
          active: true,
          secret: false,
          image: null,
          channelId: 'channel-1',
          type: { label: 'message', data: null },
        },
        {
          id: 'public-a',
          title: 'Alpha',
          description: '',
          goal: 1,
          reward: 25,
          label: '',
          public: true,
          downloads: 0,
          visits: 0,
          active: true,
          secret: false,
          image: null,
          channelId: 'channel-1',
          type: { label: 'message', data: null },
        },
      ],
      t
    )

    expect(publicEntries.map(entry => entry.title)).toEqual(['Alpha', 'Beta'])
    expect(publicEntries[0].avatar).toBe('A')
  })
})
