import { describe, it, expect } from 'vitest'
import { render, screen } from '../../utils/test-utils'
import { Badge } from '../../../components/ui/badge'
import { Button } from '../../../components/ui/button'
import { Calendar } from '../../../components/ui/calendar'
import { Progress } from '../../../components/ui/progress'
import { Slider } from '../../../components/ui/slider'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../../../components/ui/breadcrumb'
import { ScrollArea } from '../../../components/ui/scroll-area'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '../../../components/ui/input-otp'
import React from 'react'

describe('UI Components - Branch Coverage', () => {
  describe('Badge variants', () => {
    it('should render default badge', () => {
      render(<Badge>Default</Badge>)
      expect(screen.getByText('Default')).toBeInTheDocument()
    })

    it('should render secondary badge', () => {
      render(<Badge variant="secondary">Secondary</Badge>)
      expect(screen.getByText('Secondary')).toBeInTheDocument()
    })

    it('should render destructive badge', () => {
      render(<Badge variant="destructive">Destructive</Badge>)
      expect(screen.getByText('Destructive')).toBeInTheDocument()
    })

    it('should render outline badge', () => {
      render(<Badge variant="outline">Outline</Badge>)
      expect(screen.getByText('Outline')).toBeInTheDocument()
    })
  })

  describe('Button variants', () => {
    it('should render default button', () => {
      render(<Button>Default</Button>)
      expect(screen.getByText('Default')).toBeInTheDocument()
    })

    it('should render secondary button', () => {
      render(<Button variant="secondary">Secondary</Button>)
      expect(screen.getByText('Secondary')).toBeInTheDocument()
    })

    it('should render destructive button', () => {
      render(<Button variant="destructive">Destructive</Button>)
      expect(screen.getByText('Destructive')).toBeInTheDocument()
    })

    it('should render outline button', () => {
      render(<Button variant="outline">Outline</Button>)
      expect(screen.getByText('Outline')).toBeInTheDocument()
    })

    it('should render ghost button', () => {
      render(<Button variant="ghost">Ghost</Button>)
      expect(screen.getByText('Ghost')).toBeInTheDocument()
    })

    it('should render link button', () => {
      render(<Button variant="link">Link</Button>)
      expect(screen.getByText('Link')).toBeInTheDocument()
    })

    it('should render small button', () => {
      render(<Button size="sm">Small</Button>)
      expect(screen.getByText('Small')).toBeInTheDocument()
    })

    it('should render large button', () => {
      render(<Button size="lg">Large</Button>)
      expect(screen.getByText('Large')).toBeInTheDocument()
    })

    it('should render icon button', () => {
      render(<Button size="icon">Icon</Button>)
      expect(screen.getByText('Icon')).toBeInTheDocument()
    })
  })

  describe('Calendar', () => {
    it('should render calendar', () => {
      const { container } = render(<Calendar />)
      expect(container.querySelector('[role="grid"]')).toBeInTheDocument()
    })

    it('should render calendar with selected date', () => {
      const { container } = render(<Calendar selected={new Date()} />)
      expect(container.querySelector('[role="grid"]')).toBeInTheDocument()
    })
  })

  describe('Progress', () => {
    it('should render progress with value', () => {
      const { container } = render(<Progress value={50} />)
      expect(container.querySelector('[role="progressbar"]')).toBeInTheDocument()
    })

    it('should render progress without value', () => {
      const { container } = render(<Progress />)
      expect(container.querySelector('[role="progressbar"]')).toBeInTheDocument()
    })
  })

  describe('Slider', () => {
    it('should render slider with default value', () => {
      const { container } = render(<Slider defaultValue={[50]} />)
      expect(container.querySelector('[role="slider"]')).toBeInTheDocument()
    })

    it('should render slider with min and max', () => {
      const { container } = render(<Slider min={0} max={100} defaultValue={[25]} />)
      expect(container.querySelector('[role="slider"]')).toBeInTheDocument()
    })
  })

  describe('Breadcrumb', () => {
    it('should render breadcrumb with all components', () => {
      render(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/docs">Docs</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Current</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      )

      expect(screen.getByText('Home')).toBeInTheDocument()
      expect(screen.getByText('Docs')).toBeInTheDocument()
      expect(screen.getByText('Current')).toBeInTheDocument()
    })
  })

  describe('ScrollArea', () => {
    it('should render scroll area with content', () => {
      render(
        <ScrollArea className="h-[200px]">
          <div>Scrollable content</div>
        </ScrollArea>
      )

      expect(screen.getByText('Scrollable content')).toBeInTheDocument()
    })
  })

  describe('InputOTP', () => {
    it('should render input OTP with slots', () => {
      const { container } = render(
        <InputOTP maxLength={6}>
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
          </InputOTPGroup>
        </InputOTP>
      )

      const inputs = container.querySelectorAll('input')
      expect(inputs.length).toBeGreaterThan(0)
    })
  })
})
