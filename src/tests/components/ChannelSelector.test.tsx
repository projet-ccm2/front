import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '../utils/test-utils'
import { ChannelSelector } from '../../components/ui/ChannelSelector'
import React from 'react'

describe('ChannelSelector', () => {
  it('should result selected channel information', () => {
    render(<ChannelSelector />)
    expect(screen.getByText('MyTwitchChannel')).toBeInTheDocument()
    expect(screen.getByText('Moderator')).toBeInTheDocument()
  })

  it('should toggle dropdown when clicked', () => {
    render(<ChannelSelector />)

    const button = screen.getByRole('button', { name: /MyTwitchChannel/i })
    fireEvent.click(button)

    // Check for dropdown content
    expect(screen.getByText('MANAGE CHANNELS')).toBeInTheDocument()

    // Close it
    fireEvent.click(button)
    expect(screen.queryByText('MANAGE CHANNELS')).not.toBeInTheDocument()
  })

  it('should allow selecting a different channel', () => {
    render(<ChannelSelector />)

    // Open dropdown
    const button = screen.getByRole('button', { name: /MyTwitchChannel/i })
    fireEvent.click(button)

    // Find another channel (e.g. ProGamingHub)
    const newChannel = screen.getByText('ProGamingHub')
    fireEvent.click(newChannel)

    // Should now show ProGamingHub as selected
    expect(screen.getAllByText('ProGamingHub').length).toBeGreaterThan(0)
  })
})
