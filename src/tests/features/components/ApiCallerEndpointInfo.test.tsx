import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '../../utils/test-utils'
import { ApiCallerEndpointInfo } from '../../../features/achievements/components/ApiCallerEndpointInfo'
import React from 'react'

describe('ApiCallerEndpointInfo', () => {
  beforeEach(() => {
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
      writable: true,
      configurable: true,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders the endpoint URL and copy button', () => {
    render(<ApiCallerEndpointInfo achievementId="ach-1" />)
    expect(screen.getByText('POST')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Copier|Copy/i })).toBeInTheDocument()
  })

  it('copies the URL to clipboard when copy button is clicked', async () => {
    render(<ApiCallerEndpointInfo achievementId="ach-1" />)
    fireEvent.click(screen.getByRole('button', { name: /Copier|Copy/i }))
    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalled()
    })
  })

  it('opens the docs dialog when help button is clicked', async () => {
    render(<ApiCallerEndpointInfo achievementId="ach-1" />)
    const buttons = screen.getAllByRole('button')
    // Second button is the help/docs button
    fireEvent.click(buttons[1])
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
  })

  it('handles missing clipboard API gracefully', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      value: undefined,
      writable: true,
      configurable: true,
    })

    render(<ApiCallerEndpointInfo achievementId="ach-1" />)
    fireEvent.click(screen.getByRole('button', { name: /Copier|Copy/i }))
    // Should not throw
  })

  it('handles clipboard writeText rejection gracefully', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: vi.fn().mockRejectedValue(new Error('Not allowed')) },
      writable: true,
      configurable: true,
    })

    render(<ApiCallerEndpointInfo achievementId="ach-1" />)
    fireEvent.click(screen.getByRole('button', { name: /Copier|Copy/i }))
    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalled()
    })
    // Should not throw and stay in idle state
  })
})
