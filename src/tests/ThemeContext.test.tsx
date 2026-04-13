import { describe, it, expect, vi } from 'vitest'
import { render, screen, act } from './utils/test-utils'
import { render as rawRender } from '@testing-library/react'
import { ThemeProvider, useTheme } from '../context/ThemeContext'
import React from 'react'

class TestErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: string | null }
> {
  state = { error: null }

  static getDerivedStateFromError(error: Error) {
    return { error: error.message }
  }

  render() {
    if (this.state.error) {
      return <div>{this.state.error}</div>
    }

    return this.props.children
  }
}

describe('ThemeContext', () => {
  it('should render children', () => {
    render(
      <ThemeProvider>
        <div>Test Child</div>
      </ThemeProvider>
    )
    expect(screen.getByText('Test Child')).toBeInTheDocument()
  })

  it('should provide default theme as light', () => {
    const TestComponent = () => {
      const { theme } = useTheme()
      return <div>Current theme: {theme}</div>
    }
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )
    expect(screen.getByText('Current theme: light')).toBeInTheDocument()
  })

  it('should toggle theme from light to dark and back', async () => {
    const TestComponent = () => {
      const { theme, toggleTheme } = useTheme()
      return <button onClick={toggleTheme}>{theme}</button>
    }
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )

    const button = screen.getByRole('button')
    expect(button).toHaveTextContent('light')

    await act(async () => {
      await button.click()
    })
    expect(button).toHaveTextContent('dark')

    await act(async () => {
      await button.click()
    })
    expect(button).toHaveTextContent('light')
  })

  it('should throw error when useTheme is used outside provider', () => {
    const consoleSpy = vi.spyOn(console, 'error')
    consoleSpy.mockImplementation(() => {})

    const TestComponent = () => {
      useTheme()
      return <div>Should not render</div>
    }

    rawRender(
      <TestErrorBoundary>
        <TestComponent />
      </TestErrorBoundary>
    )

    expect(screen.getByText('useTheme must be used within a ThemeProvider')).toBeInTheDocument()

    consoleSpy.mockRestore()
  })
})
