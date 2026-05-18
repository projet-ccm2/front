import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '../../utils/test-utils'
import { BadgeThumbnail } from '../../../features/badges/components/BadgeThumbnail'
import React from 'react'

describe('BadgeThumbnail', () => {
  it('renders an img element when a valid image is provided', () => {
    render(<BadgeThumbnail title="Top Fan" image="https://example.com/badge.png" />)
    const img = screen.getByAltText('Top Fan')
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', 'https://example.com/badge.png')
  })

  it('shows single-word initials when no image is provided', () => {
    render(<BadgeThumbnail title="Fan" />)
    expect(screen.getByText('FA')).toBeInTheDocument()
  })

  it('shows two-letter initials from a two-word title when no image is provided', () => {
    render(<BadgeThumbnail title="Top Fan" />)
    expect(screen.getByText('TF')).toBeInTheDocument()
  })

  it('shows fallback placeholder initials when title is blank and no image is provided', () => {
    render(<BadgeThumbnail title="" />)
    expect(screen.getByText('BA')).toBeInTheDocument()
  })

  it('falls back to initials when image fails to load', () => {
    render(<BadgeThumbnail title="Top Fan" image="https://example.com/badge.png" />)
    const img = screen.getByAltText('Top Fan')
    fireEvent.error(img)
    expect(screen.getByText('TF')).toBeInTheDocument()
  })
})
