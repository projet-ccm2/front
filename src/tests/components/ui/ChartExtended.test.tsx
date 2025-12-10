import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '../../utils/test-utils'
import {
  ChartContainer,
  ChartTooltipContent,
  ChartLegendContent,
  ChartStyle,
} from '../../../components/ui/chart'
import React from 'react'

// Mock recharts
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  Tooltip: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="tooltip">{children}</div>
  ),
  Legend: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="legend">{children}</div>
  ),
}))

describe('Chart Components', () => {
  describe('ChartContainer', () => {
    it('should render with basic config', () => {
      const config = {
        test: {
          label: 'Test Label',
          color: '#ff0000',
        },
      }

      render(
        <ChartContainer config={config}>
          <div>Chart Content</div>
        </ChartContainer>
      )

      expect(screen.getByText('Chart Content')).toBeInTheDocument()
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
    })

    it('should render with theme config', () => {
      const config = {
        test: {
          label: 'Test',
          theme: {
            light: '#ffffff',
            dark: '#000000',
          },
        },
      }

      render(
        <ChartContainer config={config}>
          <div>Themed Chart</div>
        </ChartContainer>
      )

      expect(screen.getByText('Themed Chart')).toBeInTheDocument()
    })

    it('should render with custom className', () => {
      const config = { test: { label: 'Test', color: '#000' } }

      const { container } = render(
        <ChartContainer config={config} className="custom-class">
          <div>Content</div>
        </ChartContainer>
      )

      const chartDiv = container.querySelector('[data-slot="chart"]')
      expect(chartDiv).toBeInTheDocument()
    })

    it('should render with custom id', () => {
      const config = { test: { label: 'Test', color: '#000' } }

      const { container } = render(
        <ChartContainer config={config} id="custom-id">
          <div>Content</div>
        </ChartContainer>
      )

      const chartDiv = container.querySelector('[data-chart="chart-custom-id"]')
      expect(chartDiv).toBeInTheDocument()
    })

    it('should render with empty config', () => {
      render(
        <ChartContainer config={{}}>
          <div>Empty Config</div>
        </ChartContainer>
      )

      expect(screen.getByText('Empty Config')).toBeInTheDocument()
    })

    it('should render with multiple config items', () => {
      const config = {
        item1: { label: 'Item 1', color: '#ff0000' },
        item2: { label: 'Item 2', color: '#00ff00' },
        item3: { label: 'Item 3', color: '#0000ff' },
      }

      render(
        <ChartContainer config={config}>
          <div>Multi Config</div>
        </ChartContainer>
      )

      expect(screen.getByText('Multi Config')).toBeInTheDocument()
    })
  })

  describe('ChartStyle', () => {
    it('should render style with color config', () => {
      const config = {
        test: { label: 'Test', color: '#ff0000' },
      }

      const { container } = render(<ChartStyle id="test-chart" config={config} />)

      const style = container.querySelector('style')
      expect(style).toBeInTheDocument()
    })

    it('should render style with theme config', () => {
      const config = {
        test: {
          label: 'Test',
          theme: {
            light: '#ffffff',
            dark: '#000000',
          },
        },
      }

      const { container } = render(<ChartStyle id="themed-chart" config={config} />)

      const style = container.querySelector('style')
      expect(style).toBeInTheDocument()
    })

    it('should not render style with empty config', () => {
      const { container } = render(<ChartStyle id="empty-chart" config={{}} />)

      const style = container.querySelector('style')
      expect(style).not.toBeInTheDocument()
    })

    it('should not render style with config without colors', () => {
      const config = {
        test: { label: 'Test' },
      }

      const { container } = render(<ChartStyle id="no-color-chart" config={config} />)

      const style = container.querySelector('style')
      expect(style).not.toBeInTheDocument()
    })
  })

  describe('ChartTooltipContent', () => {
    const mockConfig = {
      test: { label: 'Test Label', color: '#ff0000' },
    }

    it('should not render when not active', () => {
      const { container } = render(
        <ChartContainer config={mockConfig}>
          <ChartTooltipContent active={false} payload={[]} />
        </ChartContainer>
      )

      expect(container.querySelector('.border-border\\/50')).not.toBeInTheDocument()
    })

    it('should not render when payload is empty', () => {
      const { container } = render(
        <ChartContainer config={mockConfig}>
          <ChartTooltipContent active={true} payload={[]} />
        </ChartContainer>
      )

      expect(container.querySelector('.border-border\\/50')).not.toBeInTheDocument()
    })

    it('should render with active and payload', () => {
      const payload = [
        {
          name: 'test',
          value: 100,
          dataKey: 'test',
          color: '#ff0000',
          payload: {},
        },
      ]

      render(
        <ChartContainer config={mockConfig}>
          <ChartTooltipContent active={true} payload={payload} />
        </ChartContainer>
      )

      expect(screen.getByText('100')).toBeInTheDocument()
    })

    it('should render with label', () => {
      const payload = [
        {
          name: 'test',
          value: 200,
          dataKey: 'test',
          color: '#ff0000',
          payload: {},
        },
      ]

      render(
        <ChartContainer config={mockConfig}>
          <ChartTooltipContent active={true} payload={payload} label="Test Label" />
        </ChartContainer>
      )

      expect(screen.getByText('200')).toBeInTheDocument()
    })

    it('should hide label when hideLabel is true', () => {
      const payload = [
        {
          name: 'test',
          value: 300,
          dataKey: 'test',
          color: '#ff0000',
          payload: {},
        },
      ]

      render(
        <ChartContainer config={mockConfig}>
          <ChartTooltipContent active={true} payload={payload} hideLabel={true} />
        </ChartContainer>
      )

      expect(screen.getByText('300')).toBeInTheDocument()
    })

    it('should render with custom indicator', () => {
      const payload = [
        {
          name: 'test',
          value: 400,
          dataKey: 'test',
          color: '#ff0000',
          payload: {},
        },
      ]

      render(
        <ChartContainer config={mockConfig}>
          <ChartTooltipContent active={true} payload={payload} indicator="line" />
        </ChartContainer>
      )

      expect(screen.getByText('400')).toBeInTheDocument()
    })

    it('should render with dashed indicator', () => {
      const payload = [
        {
          name: 'test',
          value: 500,
          dataKey: 'test',
          color: '#ff0000',
          payload: {},
        },
      ]

      render(
        <ChartContainer config={mockConfig}>
          <ChartTooltipContent active={true} payload={payload} indicator="dashed" />
        </ChartContainer>
      )

      expect(screen.getByText('500')).toBeInTheDocument()
    })

    it('should hide indicator when hideIndicator is true', () => {
      const payload = [
        {
          name: 'test',
          value: 600,
          dataKey: 'test',
          color: '#ff0000',
          payload: {},
        },
      ]

      render(
        <ChartContainer config={mockConfig}>
          <ChartTooltipContent active={true} payload={payload} hideIndicator={true} />
        </ChartContainer>
      )

      expect(screen.getByText('600')).toBeInTheDocument()
    })
  })

  describe('ChartLegendContent', () => {
    const mockConfig = {
      test: { label: 'Test Label', color: '#ff0000' },
    }

    it('should not render when payload is empty', () => {
      const { container } = render(
        <ChartContainer config={mockConfig}>
          <ChartLegendContent payload={[]} />
        </ChartContainer>
      )

      expect(container.querySelector('.flex.items-center')).not.toBeInTheDocument()
    })

    it('should render with payload', () => {
      const payload = [
        {
          value: 'test',
          dataKey: 'test',
          color: '#ff0000',
        },
      ]

      render(
        <ChartContainer config={mockConfig}>
          <ChartLegendContent payload={payload} />
        </ChartContainer>
      )

      expect(screen.getByText('Test Label')).toBeInTheDocument()
    })

    it('should render with verticalAlign top', () => {
      const payload = [
        {
          value: 'test',
          dataKey: 'test',
          color: '#ff0000',
        },
      ]

      render(
        <ChartContainer config={mockConfig}>
          <ChartLegendContent payload={payload} verticalAlign="top" />
        </ChartContainer>
      )

      expect(screen.getByText('Test Label')).toBeInTheDocument()
    })

    it('should render with custom className', () => {
      const payload = [
        {
          value: 'test',
          dataKey: 'test',
          color: '#ff0000',
        },
      ]

      const { container } = render(
        <ChartContainer config={mockConfig}>
          <ChartLegendContent payload={payload} className="custom-legend" />
        </ChartContainer>
      )

      expect(container.querySelector('.custom-legend')).toBeInTheDocument()
    })

    it('should hide icon when hideIcon is true', () => {
      const payload = [
        {
          value: 'test',
          dataKey: 'test',
          color: '#ff0000',
        },
      ]

      render(
        <ChartContainer config={mockConfig}>
          <ChartLegendContent payload={payload} hideIcon={true} />
        </ChartContainer>
      )

      expect(screen.getByText('Test Label')).toBeInTheDocument()
    })
  })
})
