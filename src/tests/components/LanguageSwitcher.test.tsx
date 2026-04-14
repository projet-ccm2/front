import { describe, it, expect, beforeEach } from 'vitest'
import { fireEvent, render, screen } from '../utils/test-utils'
import { LanguageSwitcher } from '../../components/ui/LanguageSwitcher'

describe('LanguageSwitcher', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should render the default French state', () => {
    render(<LanguageSwitcher />)

    expect(screen.getByRole('button', { name: /Angl/i })).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByRole('button', { name: /Fran/i })).toHaveAttribute('aria-pressed', 'true')
  })

  it('should switch language when a button is clicked', () => {
    render(<LanguageSwitcher />)

    fireEvent.click(screen.getByRole('button', { name: /Angl/i }))

    expect(screen.getByRole('button', { name: 'English' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'French' })).toHaveAttribute('aria-pressed', 'false')
  })
})
