import { describe, it, expect, beforeEach } from 'vitest'
import { fireEvent, render, screen } from '../utils/test-utils'
import { LanguageSwitcher } from '../../components/ui/LanguageSwitcher'

describe('LanguageSwitcher', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should render the default French state', () => {
    render(<LanguageSwitcher />)

    expect(screen.getByRole('button', { name: /anglais/i })).toHaveAttribute(
      'aria-pressed',
      'false'
    )
    expect(screen.getByRole('button', { name: /fran/i })).toHaveAttribute('aria-pressed', 'true')
  })

  it('should switch language when a button is clicked', () => {
    render(<LanguageSwitcher />)

    const [englishButton] = screen.getAllByRole('button')
    fireEvent.click(englishButton)

    expect(screen.getByRole('button', { name: /switch to english/i })).toHaveAttribute(
      'aria-pressed',
      'true'
    )
    expect(screen.getByRole('button', { name: /switch to french/i })).toHaveAttribute(
      'aria-pressed',
      'false'
    )
  })
})
