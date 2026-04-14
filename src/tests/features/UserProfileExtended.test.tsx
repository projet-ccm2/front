import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '../utils/test-utils'
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

describe('UserProfile - Function Coverage', () => {
  beforeEach(() => {
    localStorage.setItem('twitch_user', JSON.stringify(authUser))
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve(mockUserAchievements),
        })
      )
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    localStorage.clear()
  })

  it('should render user profile with correct user info', async () => {
    render(<UserProfile onOpenSidebar={() => {}} />)
    expect(screen.getAllByText('streamer').length).toBeGreaterThan(0)
    expect((await screen.findAllByText('First Steps')).length).toBeGreaterThan(0)
  })

  it('should render stats cards', async () => {
    render(<UserProfile onOpenSidebar={() => {}} />)

    await screen.findAllByText('First Steps')
    expect(screen.getByText('Temps de visionnage total')).toBeInTheDocument()
    expect(screen.getByText(/Succ.*d.*bloqu.*s/i)).toBeInTheDocument()
    expect(screen.getByText(/XP de succ.*s/i)).toBeInTheDocument()
  })

  it('should render badges section', async () => {
    render(<UserProfile onOpenSidebar={() => {}} />)

    expect(screen.getByRole('heading', { name: /Badges de succ.*s/i })).toBeInTheDocument()
    expect((await screen.findAllByText('First Steps')).length).toBeGreaterThan(0)
  })

  it('should render account leaderboard section', async () => {
    render(<UserProfile onOpenSidebar={() => {}} />)

    await screen.findAllByText('First Steps')
    expect(screen.getByText('Classement')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Classement global/i })).toBeInTheDocument()
    expect(screen.getByText(/Classement des comptes par niveau et XP/i)).toBeInTheDocument()
    expect(screen.getAllByText('streamer').length).toBeGreaterThan(0)
    expect(screen.getByText(/Niveau 1\s*•\s*50 XP/i)).toBeInTheDocument()
  })
})
