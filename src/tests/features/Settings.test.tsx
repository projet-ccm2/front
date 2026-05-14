import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '../utils/test-utils'
import { Settings } from '../../features/settings/Settings'

vi.mock('../../features/settings/hooks/useNukeAccount', () => ({
  useNukeAccount: vi.fn(),
}))

import { useNukeAccount } from '../../features/settings/hooks/useNukeAccount'

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

function setupAuth() {
  localStorage.setItem('stream-quest_language', 'en')
  localStorage.setItem('twitch_user', JSON.stringify(authUser))
  localStorage.setItem(
    'twitch_tokens',
    JSON.stringify({
      accessToken: 'token-abc',
      idToken: 'id',
      tokenType: 'bearer',
      expiresIn: 3600,
      scope: [],
    })
  )
}

const mockNuke = vi.fn()
const defaultHookReturn = {
  nuke: mockNuke,
  isDeleting: false,
  error: null,
  resetError: vi.fn(),
}

describe('Settings', () => {
  const onOpenSidebar = vi.fn()
  const onNavigate = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    setupAuth()
    vi.mocked(useNukeAccount).mockReturnValue(defaultHookReturn)
    vi.useFakeTimers()
  })

  afterEach(() => {
    localStorage.clear()
    vi.useRealTimers()
  })

  it('renders the danger zone section', () => {
    render(<Settings onOpenSidebar={onOpenSidebar} onNavigate={onNavigate} />)
    expect(screen.getByText('Danger Zone')).toBeInTheDocument()
    expect(screen.getAllByText('Delete all my data').length).toBeGreaterThan(0)
  })

  it('nuke button opens the dialog at step 1', () => {
    render(<Settings onOpenSidebar={onOpenSidebar} onNavigate={onNavigate} />)
    const buttons = screen.getAllByText('Delete all my data')
    fireEvent.click(buttons[buttons.length - 1])
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Delete all your data?')).toBeInTheDocument()
  })

  it('cancel button closes the dialog', () => {
    render(<Settings onOpenSidebar={onOpenSidebar} onNavigate={onNavigate} />)
    const buttons = screen.getAllByText('Delete all my data')
    fireEvent.click(buttons[buttons.length - 1])
    fireEvent.click(screen.getByText('Cancel'))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('step 1 → Continue → shows step 2', () => {
    render(<Settings onOpenSidebar={onOpenSidebar} onNavigate={onNavigate} />)
    const buttons = screen.getAllByText('Delete all my data')
    fireEvent.click(buttons[buttons.length - 1])
    fireEvent.click(screen.getByText('Continue'))
    expect(screen.getByText('Confirm your identity')).toBeInTheDocument()
    expect(screen.getByTestId('username-input')).toBeInTheDocument()
  })

  it('step 2 confirm button is disabled until correct username is typed', () => {
    render(<Settings onOpenSidebar={onOpenSidebar} onNavigate={onNavigate} />)
    const buttons = screen.getAllByText('Delete all my data')
    fireEvent.click(buttons[buttons.length - 1])
    fireEvent.click(screen.getByText('Continue'))

    const confirmBtn = screen.getByText('I understand, delete my data')
    expect(confirmBtn).toBeDisabled()

    fireEvent.change(screen.getByTestId('username-input'), { target: { value: 'wrongname' } })
    expect(confirmBtn).toBeDisabled()

    fireEvent.change(screen.getByTestId('username-input'), { target: { value: 'streamer' } })
    expect(confirmBtn).not.toBeDisabled()
  })

  it('step 2 correct username → shows step 3', () => {
    render(<Settings onOpenSidebar={onOpenSidebar} onNavigate={onNavigate} />)
    const buttons = screen.getAllByText('Delete all my data')
    fireEvent.click(buttons[buttons.length - 1])
    fireEvent.click(screen.getByText('Continue'))
    fireEvent.change(screen.getByTestId('username-input'), { target: { value: 'streamer' } })
    fireEvent.click(screen.getByText('I understand, delete my data'))
    expect(screen.getByText('Final confirmation')).toBeInTheDocument()
  })

  it('step 3 confirm button is disabled during countdown and enabled after', () => {
    render(<Settings onOpenSidebar={onOpenSidebar} onNavigate={onNavigate} />)
    const buttons = screen.getAllByText('Delete all my data')
    fireEvent.click(buttons[buttons.length - 1])
    fireEvent.click(screen.getByText('Continue'))
    fireEvent.change(screen.getByTestId('username-input'), { target: { value: 'streamer' } })
    fireEvent.click(screen.getByText('I understand, delete my data'))

    expect(screen.getByText(/Wait \d+s\.\.\./)).toBeDisabled()

    act(() => {
      vi.advanceTimersByTime(5000)
    })

    expect(screen.getByText('Permanently delete all my data')).not.toBeDisabled()
  })

  it('back button navigates from step 3 to step 2', () => {
    render(<Settings onOpenSidebar={onOpenSidebar} onNavigate={onNavigate} />)
    const buttons = screen.getAllByText('Delete all my data')
    fireEvent.click(buttons[buttons.length - 1])
    fireEvent.click(screen.getByText('Continue'))
    fireEvent.change(screen.getByTestId('username-input'), { target: { value: 'streamer' } })
    fireEvent.click(screen.getByText('I understand, delete my data'))
    fireEvent.click(screen.getByText('Back'))
    expect(screen.getByText('Confirm your identity')).toBeInTheDocument()
  })

  it('calls nuke and onNavigate("landing") on confirmed deletion', async () => {
    mockNuke.mockImplementation((_token: string, onSuccess: () => void) => {
      onSuccess()
      return Promise.resolve()
    })

    render(<Settings onOpenSidebar={onOpenSidebar} onNavigate={onNavigate} />)
    const buttons = screen.getAllByText('Delete all my data')
    fireEvent.click(buttons[buttons.length - 1])
    fireEvent.click(screen.getByText('Continue'))
    fireEvent.change(screen.getByTestId('username-input'), { target: { value: 'streamer' } })
    fireEvent.click(screen.getByText('I understand, delete my data'))

    act(() => {
      vi.advanceTimersByTime(5000)
    })

    await act(async () => {
      fireEvent.click(screen.getByText('Permanently delete all my data'))
    })

    expect(mockNuke).toHaveBeenCalled()
    expect(onNavigate).toHaveBeenCalledWith('landing')
  })

  it('shows loading state while deleting', async () => {
    vi.mocked(useNukeAccount).mockReturnValue({
      ...defaultHookReturn,
      isDeleting: true,
    })

    render(<Settings onOpenSidebar={onOpenSidebar} onNavigate={onNavigate} />)
    const buttons = screen.getAllByText('Delete all my data')
    fireEvent.click(buttons[buttons.length - 1])
    fireEvent.click(screen.getByText('Continue'))
    fireEvent.change(screen.getByTestId('username-input'), { target: { value: 'streamer' } })
    fireEvent.click(screen.getByText('I understand, delete my data'))

    act(() => {
      vi.advanceTimersByTime(5000)
    })

    expect(screen.getByText('Deleting...')).toBeInTheDocument()
  })

  it('shows error message when nuke fails', async () => {
    vi.mocked(useNukeAccount).mockReturnValue({
      ...defaultHookReturn,
      error: 'Some server error',
    })

    render(<Settings onOpenSidebar={onOpenSidebar} onNavigate={onNavigate} />)
    const buttons = screen.getAllByText('Delete all my data')
    fireEvent.click(buttons[buttons.length - 1])
    fireEvent.click(screen.getByText('Continue'))
    fireEvent.change(screen.getByTestId('username-input'), { target: { value: 'streamer' } })
    fireEvent.click(screen.getByText('I understand, delete my data'))

    expect(
      screen.getByText('An error occurred while deleting your data. Please try again.')
    ).toBeInTheDocument()
  })
})
