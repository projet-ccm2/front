import type { ReactElement } from 'react'
import { render } from '@testing-library/react'
import type { RenderOptions } from '@testing-library/react'
import { StrictMode } from 'react'

import { ThemeProvider } from '../../context/ThemeContext'
import { ChannelProvider } from '../../context/ChannelContext'

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <StrictMode>
      <ThemeProvider>
        <ChannelProvider>{children}</ChannelProvider>
      </ThemeProvider>
    </StrictMode>
  )
}

const customRender = (ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) =>
  render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }
