import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '../utils/test-utils'
import { UserProfile } from '../../features/profile/UserProfile'
import React from 'react'

const authUser = {
  userId: 'user-1',
  username: 'streamer',
  channel: {
    id: 'channel-1',
    name: 'MyChannel',
    description: 'desc',
    profileImageUrl: '',
  },
  channelsWhichIsMod: [],
}

const mockUserAchievements = [
  {
    id: '1',
    title: 'First Steps',
    description: 'Watch your first stream',
    goal: 1,
    reward: 50,
    label: 'FS',
    public: true,
    downloads: 0,
    visits: 0,
    active: true,
    secret: false,
    image: null,
    channelId: 'channel-1',
    type: { label: 'message', data: null },
    userState: {
      progressCount: 1,
      finished: true,
      acquiredDate: null,
    },
  },
]

const mockLeaderboard = [
  { username: 'streamer', userId: 'user-1', xp: 500 },
  { username: 'viewer1', userId: 'user-2', xp: 350 },
  { username: 'viewer2', userId: 'user-3', xp: 200 },
]

describe('UserProfile - Function Coverage', () => {
  beforeEach(() => {
    localStorage.setItem('twitch_user', JSON.stringify(authUser))
    vi.stubGlobal(
      'fetch',
      vi.fn((input: RequestInfo | URL) => {
        const url = String(input)

        if (url.includes('/leaderboard')) {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: () => Promise.resolve(mockLeaderboard),
          })
        }

        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve(mockUserAchievements),
        })
      })
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    localStorage.clear()
  })

  it('should render user profile with correct user info', async () => {
    render(<UserProfile onOpenSidebar={() => {}} />)
    expect(screen.getAllByText('streamer').length).toBeGreaterThan(0)
    // Achievement XP is reflected in the XP bar once data loads
    expect(await screen.findByText(/50 \/ 250 XP/)).toBeInTheDocument()
  })

  it('should render stats cards', async () => {
    render(<UserProfile onOpenSidebar={() => {}} />)

    expect(await screen.findByText(/1 \/ 1/)).toBeInTheDocument()
    expect(screen.getByText(/Succ.*d.*bloqu.*s/i)).toBeInTheDocument()
    expect(screen.getByText(/XP de succ.*s/i)).toBeInTheDocument()
  })

  it('should render account leaderboard section with real data', async () => {
    render(<UserProfile onOpenSidebar={() => {}} />)

    expect(screen.getByText('Classement')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText('viewer1')).toBeInTheDocument()
    })

    expect(screen.getByText('viewer2')).toBeInTheDocument()
    expect(screen.getByText('500 XP')).toBeInTheDocument()
    expect(screen.getByText('350 XP')).toBeInTheDocument()
  })
})
