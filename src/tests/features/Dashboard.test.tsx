import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor, fireEvent } from '../utils/test-utils'
import { Dashboard } from '../../features/dashboard/Dashboard'
import React from 'react'

// Mock Recharts to avoid heavy rendering
vi.mock('recharts', () => {
  return {
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="recharts-responsive">{children}</div>
    ),
    AreaChart: () => <div data-testid="recharts-area" />,
    LineChart: () => <div data-testid="recharts-line" />,
    Area: () => <div />,
    Line: () => <div />,
    XAxis: () => <div />,
    YAxis: () => <div />,
    CartesianGrid: () => <div />,
    Tooltip: () => <div />,
  }
})

describe('Dashboard', () => {
  it('should render dashboard title', async () => {
    render(<Dashboard onNavigate={() => {}} />)

    await waitFor(
      () => {
        expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument()
      },
      { timeout: 3000 }
    )
  })

  it('should render statistics cards after loading', async () => {
    render(<Dashboard onNavigate={() => {}} />)

    await waitFor(
      () => {
        expect(screen.getByText('Total Unlocks')).toBeInTheDocument()
        expect(screen.getByText('Active Achievements')).toBeInTheDocument()
      },
      { timeout: 3000 }
    )
  })

  it('should navigate to creator page', async () => {
    const mockNavigate = vi.fn()
    render(<Dashboard onNavigate={mockNavigate} />)

    await waitFor(
      () => {
        const elements = screen.getAllByText('Create Achievement')
        expect(elements.length).toBeGreaterThan(0)
      },
      { timeout: 3000 }
    )
    const createBtns = screen.getAllByText('Create Achievement')
    const createBtn = createBtns.find(el => el.closest('button'))

    if (createBtn) {
      fireEvent.click(createBtn)
      expect(mockNavigate).toHaveBeenCalledWith('creator')
    }
  })

  it('should toggle sidebar on mobile', async () => {
    const mockOnNavigate = vi.fn()
    render(<Dashboard onNavigate={mockOnNavigate} />)

    await waitFor(
      () => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
      },
      { timeout: 3000 }
    )

    const menuBtn = screen.getByTestId('mobile-menu-btn')
    fireEvent.click(menuBtn)
  })

  it('should handle quick actions', async () => {
    const mockOnNavigate = vi.fn()
    render(<Dashboard onNavigate={mockOnNavigate} />)

    await waitFor(
      () => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
      },
      { timeout: 3000 }
    )

    const createBtn = screen.getByTestId('quick-create-btn')
    fireEvent.click(createBtn)
    expect(mockOnNavigate).toHaveBeenCalledWith('creator')

    const manageBtn = screen.getByTestId('quick-manage-btn')
    fireEvent.click(manageBtn)
    expect(mockOnNavigate).toHaveBeenCalledWith('management')
  })

  it('should navigate to marketplace', async () => {
    const mockOnNavigate = vi.fn()
    render(<Dashboard onNavigate={mockOnNavigate} />)

    await waitFor(
      () => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
      },
      { timeout: 3000 }
    )

    const marketplaceBtn = screen.getByTestId('quick-marketplace-btn')
    fireEvent.click(marketplaceBtn)
    expect(mockOnNavigate).toHaveBeenCalledWith('marketplace')
  })
})
