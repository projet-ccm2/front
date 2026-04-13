import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '../utils/test-utils'
import { AchievementCreator } from '../../features/achievements/AchievementCreator'
import React from 'react'

const marketplaceTemplate = {
  id: 'template-1',
  title: 'Marketplace Template',
  description: 'Imported from marketplace',
  goal: 75,
  reward: 300,
  label: 'MT',
  public: true,
  downloads: 123,
  visits: 456,
  active: true,
  secret: false,
  image: null,
  channelId: null,
  type: {
    label: 'message_content' as const,
    data: 'gg',
  },
}

describe('AchievementCreator', () => {
  const mockOnOpenSidebar = vi.fn()
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

  const mockFetch = vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input)

    if (url.match(/\/achievements$/) && init?.method === 'POST') {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            id: 'created-achievement',
            ...JSON.parse(String(init.body)),
            downloads: 0,
            visits: 0,
          }),
      })
    }

    if (url.includes('/achievements/edit-1') && !init?.method) {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            id: 'edit-1',
            title: 'Existing Achievement',
            description: 'Existing description',
            goal: 300,
            reward: 600,
            label: 'EA',
            public: true,
            downloads: 0,
            visits: 0,
            active: true,
            secret: false,
            image: null,
            channelId: 'channel-1',
            type: {
              label: 'message',
              data: null,
            },
          }),
      })
    }

    if (url.includes('/achievements/edit-1') && init?.method === 'PUT') {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            id: 'edit-1',
            ...JSON.parse(String(init.body)),
            downloads: 0,
            visits: 0,
            channelId: 'channel-1',
          }),
      })
    }

    if (url.includes('/achievements/ai-suggestion') && init?.method === 'POST') {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            title: 'Chat Warrior',
            description: 'Unlock this achievement after sending 250 messages in chat.',
            goal: 250,
            reward: 250,
            public: false,
            active: true,
            secret: false,
            type: {
              label: 'message',
              data: null,
            },
          }),
      })
    }

    return Promise.resolve({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ message: `Unhandled request: ${url}` }),
      text: () => Promise.resolve(`Unhandled request: ${url}`),
    })
  })

  beforeEach(() => {
    localStorage.setItem('twitch_user', JSON.stringify(authUser))
    vi.stubGlobal('fetch', mockFetch)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    localStorage.clear()
  })

  it('should render the achievement creator page', () => {
    render(<AchievementCreator onOpenSidebar={mockOnOpenSidebar} />)
    expect(screen.getByRole('heading', { name: 'Create Achievement' })).toBeInTheDocument()
  })

  it('should prefill the form from a marketplace template', async () => {
    render(
      <AchievementCreator
        templateAchievement={marketplaceTemplate}
        onOpenSidebar={mockOnOpenSidebar}
      />
    )

    expect(
      screen.getByText('Template "Marketplace Template" loaded from the marketplace.')
    ).toBeInTheDocument()
    expect(screen.getByDisplayValue('Marketplace Template')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Imported from marketplace')).toBeInTheDocument()
    expect(screen.getByLabelText('Goal')).toHaveValue(75)
    expect(screen.getByLabelText('Reward (XP / Points)')).toHaveValue(300)
    expect(screen.getByText('Advanced Mode')).toBeInTheDocument()
    expect(screen.getByLabelText('Trigger Type')).toHaveValue('message_content')
    expect(screen.getByLabelText('Trigger Data')).toHaveValue('gg')
  })

  it('should allow entering achievement title', () => {
    render(<AchievementCreator onOpenSidebar={mockOnOpenSidebar} />)
    const titleInput = screen.getByPlaceholderText('Enter achievement name...')
    fireEvent.change(titleInput, { target: { value: 'Test Achievement' } })
    expect(titleInput).toHaveValue('Test Achievement')
  })

  it('should allow entering description', () => {
    render(<AchievementCreator onOpenSidebar={mockOnOpenSidebar} />)
    const descInput = screen.getByPlaceholderText('Describe how to unlock this achievement...')
    fireEvent.change(descInput, { target: { value: 'Test description' } })
    expect(descInput).toHaveValue('Test description')
  })

  it('should toggle secret achievement setting', () => {
    render(<AchievementCreator onOpenSidebar={mockOnOpenSidebar} />)
    const toggle = screen.getByRole('button', { name: /Secret Achievement/i })
    fireEvent.click(toggle)
    fireEvent.click(toggle)
    expect(toggle).toBeInTheDocument()
  })

  it('should switch between simple and advanced modes', () => {
    render(<AchievementCreator onOpenSidebar={mockOnOpenSidebar} />)
    fireEvent.click(screen.getByText('Advanced Mode'))
    expect(screen.getByText('Trigger Type')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Simple Mode'))
  })

  it('should render the default AI prompt', () => {
    render(<AchievementCreator onOpenSidebar={mockOnOpenSidebar} />)
    expect(
      screen.getByDisplayValue('Create an achievement for a user who sends 100 messages')
    ).toBeInTheDocument()
  })

  it('should prefill the form from the AI suggestion route', async () => {
    render(<AchievementCreator onOpenSidebar={mockOnOpenSidebar} />)

    fireEvent.click(screen.getByText('Generate with AI'))

    expect(await screen.findByDisplayValue('Chat Warrior')).toBeInTheDocument()
    expect(screen.getByLabelText('Goal')).toHaveValue(250)
    expect(screen.getByLabelText('Reward (XP / Points)')).toHaveValue(250)

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/achievements/ai-suggestion'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            prompt: 'Create an achievement for a user who sends 100 messages',
          }),
        })
      )
    })
  })

  it('should toggle sidebar on mobile', () => {
    render(<AchievementCreator onOpenSidebar={mockOnOpenSidebar} />)
    fireEvent.click(screen.getByTestId('mobile-menu-btn'))
    expect(mockOnOpenSidebar).toHaveBeenCalled()
  })

  it('should allow editing goal and reward', () => {
    render(<AchievementCreator onOpenSidebar={mockOnOpenSidebar} />)
    const goalInput = screen.getByLabelText('Goal')
    const rewardInput = screen.getByLabelText('Reward (XP / Points)')

    fireEvent.change(goalInput, { target: { value: '300' } })
    fireEvent.change(rewardInput, { target: { value: '500' } })

    expect(goalInput).toHaveValue(300)
    expect(rewardInput).toHaveValue(500)
  })

  it('should render all form elements', () => {
    render(<AchievementCreator onOpenSidebar={mockOnOpenSidebar} />)

    expect(screen.getByText('Achievement Icon')).toBeInTheDocument()
    expect(screen.getByText('Achievement Title')).toBeInTheDocument()
    expect(screen.getByText('Description')).toBeInTheDocument()
    expect(screen.getByText('Goal')).toBeInTheDocument()
    expect(screen.getByText('Reward (XP / Points)')).toBeInTheDocument()
    expect(screen.getByText('Save Draft')).toBeInTheDocument()
    expect(screen.getByText('Publish Achievement')).toBeInTheDocument()
  })

  it('should render AI generation banner', () => {
    render(<AchievementCreator onOpenSidebar={mockOnOpenSidebar} />)

    expect(screen.getByText('AI-Powered Generation')).toBeInTheDocument()
    expect(
      screen.getByText('Let AI create an achievement based on your channel context')
    ).toBeInTheDocument()
    expect(screen.getByLabelText('AI Prompt')).toBeInTheDocument()
  })

  it('should render version info', () => {
    render(<AchievementCreator onOpenSidebar={mockOnOpenSidebar} />)

    expect(screen.getByText('Version 1.0')).toBeInTheDocument()
    expect(screen.getByText('This is a new achievement')).toBeInTheDocument()
  })

  it('should render upload button and image input', () => {
    render(<AchievementCreator onOpenSidebar={mockOnOpenSidebar} />)

    expect(screen.getByText('Upload Image')).toBeInTheDocument()
    expect(screen.getByText('Recommended: 512x512px PNG or JPG')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Optional image URL...')).toBeInTheDocument()
  })

  it('should render advanced trigger fields', () => {
    render(<AchievementCreator onOpenSidebar={mockOnOpenSidebar} />)
    fireEvent.click(screen.getByText('Advanced Mode'))

    expect(screen.getByLabelText('Trigger Type')).toBeInTheDocument()
    expect(screen.getByLabelText('Trigger Data')).toBeInTheDocument()
  })

  it('should allow changing trigger type and trigger data', () => {
    render(<AchievementCreator onOpenSidebar={mockOnOpenSidebar} />)
    fireEvent.click(screen.getByText('Advanced Mode'))

    const triggerSelect = screen.getByLabelText('Trigger Type')
    const triggerDataInput = screen.getByLabelText('Trigger Data')

    fireEvent.change(triggerSelect, { target: { value: 'message_content' } })
    fireEvent.change(triggerDataInput, { target: { value: 'hello world' } })

    expect(triggerSelect).toHaveValue('message_content')
    expect(triggerDataInput).toHaveValue('hello world')
  })

  it('should show an error when the AI prompt is empty', async () => {
    render(<AchievementCreator onOpenSidebar={mockOnOpenSidebar} />)

    fireEvent.change(screen.getByLabelText('AI Prompt'), { target: { value: '   ' } })
    fireEvent.click(screen.getByText('Generate with AI'))

    expect(
      await screen.findByText('Enter an AI prompt before requesting a suggestion.')
    ).toBeInTheDocument()
  })

  it('should show an error when the AI suggestion request fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 502,
          json: () => Promise.resolve({ message: 'bad gateway' }),
          text: () => Promise.resolve('bad gateway'),
        })
      )
    )

    render(<AchievementCreator onOpenSidebar={mockOnOpenSidebar} />)

    fireEvent.click(screen.getByText('Generate with AI'))

    expect(
      await screen.findByText('Unable to generate an AI suggestion right now.')
    ).toBeInTheDocument()
  })

  it('should publish the achievement to the create route', async () => {
    render(<AchievementCreator onOpenSidebar={mockOnOpenSidebar} />)

    fireEvent.change(screen.getByPlaceholderText('Enter achievement name...'), {
      target: { value: 'First 100 Messages' },
    })
    fireEvent.change(screen.getByPlaceholderText('Describe how to unlock this achievement...'), {
      target: { value: 'Unlock after 100 messages.' },
    })
    fireEvent.change(screen.getByLabelText('Goal'), {
      target: { value: '100' },
    })
    fireEvent.change(screen.getByLabelText('Reward (XP / Points)'), {
      target: { value: '250' },
    })

    fireEvent.click(screen.getByText('Publish Achievement'))

    expect(
      await screen.findByText('Achievement "First 100 Messages" was published.')
    ).toBeInTheDocument()
  })

  it('should block publishing for synthetic moderator channel ids', async () => {
    localStorage.setItem(
      'twitch_user',
      JSON.stringify({
        ...authUser,
        channelsWhichIsMod: ['ModChannel'],
      })
    )

    render(<AchievementCreator onOpenSidebar={mockOnOpenSidebar} />)

    fireEvent.click(screen.getByText('MyChannel'))
    fireEvent.click(screen.getByText('ModChannel'))
    fireEvent.click(screen.getByText('Publish Achievement'))

    expect(
      await screen.findByText(
        'Achievement management currently supports only the connected user channel. Moderator channels are not handled yet.'
      )
    ).toBeInTheDocument()
  })

  it('should load an existing achievement in edit mode', async () => {
    render(<AchievementCreator achievementId="edit-1" onOpenSidebar={mockOnOpenSidebar} />)

    expect(await screen.findByDisplayValue('Existing Achievement')).toBeInTheDocument()
    expect(screen.getByLabelText('Goal')).toHaveValue(300)
    expect(screen.getByText('Edit Achievement')).toBeInTheDocument()
  })

  it('should update an existing achievement through the update route', async () => {
    render(<AchievementCreator achievementId="edit-1" onOpenSidebar={mockOnOpenSidebar} />)

    expect(await screen.findByDisplayValue('Existing Achievement')).toBeInTheDocument()
    fireEvent.change(screen.getByPlaceholderText('Enter achievement name...'), {
      target: { value: 'Updated Achievement' },
    })
    fireEvent.click(screen.getByText('Update Achievement'))

    expect(
      await screen.findByText('Achievement "Updated Achievement" was updated.')
    ).toBeInTheDocument()

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/achievements/edit-1'),
        expect.objectContaining({
          method: 'PUT',
        })
      )
    })
  })
})
