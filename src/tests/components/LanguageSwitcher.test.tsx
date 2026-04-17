import { describe, it, expect, beforeEach } from 'vitest'
import { fireEvent, render, screen } from '../utils/test-utils'
import { LanguageSwitcher } from '../../components/ui/LanguageSwitcher'

describe('LanguageSwitcher', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should render the default French state', () => {
    render(<LanguageSwitcher />)

    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true')
  })

  it('should switch language when clicked', () => {
    render(<LanguageSwitcher />)

    fireEvent.click(screen.getByRole('switch'))

    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'false')
  })
})
