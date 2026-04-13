import type { ReactElement } from 'react'
import { render } from '@testing-library/react'
import { renderHook } from '@testing-library/react'
import type { RenderOptions } from '@testing-library/react'
import type { RenderHookOptions, RenderHookResult } from '@testing-library/react'
import { StrictMode } from 'react'

import { ThemeProvider } from '../../context/ThemeContext'
import { ChannelProvider } from '../../context/ChannelContext'
import { AuthProvider } from '../../context/AuthContext'

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <StrictMode>
      <ThemeProvider>
        <AuthProvider>
          <ChannelProvider>{children}</ChannelProvider>
        </AuthProvider>
      </ThemeProvider>
    </StrictMode>
  )
}

const customRender = (ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) =>
  render(ui, { wrapper: AllTheProviders, ...options })

const customRenderHook = <Result, Props>(
  renderCallback: (initialProps: Props) => Result,
  options?: Omit<RenderHookOptions<Props>, 'wrapper'>
): RenderHookResult<Result, Props> =>
  renderHook(renderCallback, {
    wrapper: AllTheProviders,
    ...options,
  })

export * from '@testing-library/react'
export { customRender as render }
export { customRenderHook as renderHook }
