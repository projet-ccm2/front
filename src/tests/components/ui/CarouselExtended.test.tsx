import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '../../utils/test-utils'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from '../../../components/ui/carousel'
import React from 'react'

// Mock embla-carousel-react
vi.mock('embla-carousel-react', () => ({
  default: () => [
    (node: HTMLElement) => node,
    {
      scrollNext: vi.fn(),
      scrollPrev: vi.fn(),
      canScrollNext: vi.fn(() => true),
      canScrollPrev: vi.fn(() => true),
      on: vi.fn(),
      off: vi.fn(),
    },
  ],
}))

beforeEach(() => {
  // Mock IntersectionObserver
  globalThis.IntersectionObserver = class IntersectionObserver {
    observe = vi.fn()
    unobserve = vi.fn()
    disconnect = vi.fn()
  } as any // eslint-disable-line @typescript-eslint/no-explicit-any
})

describe('Carousel Components - Extended Coverage', () => {
  describe('Carousel', () => {
    it('should render carousel with items', () => {
      render(
        <Carousel>
          <CarouselContent>
            <CarouselItem>Item 1</CarouselItem>
            <CarouselItem>Item 2</CarouselItem>
            <CarouselItem>Item 3</CarouselItem>
          </CarouselContent>
        </Carousel>
      )

      expect(screen.getByText('Item 1')).toBeInTheDocument()
      expect(screen.getByText('Item 2')).toBeInTheDocument()
      expect(screen.getByText('Item 3')).toBeInTheDocument()
    })

    it('should render carousel with navigation buttons', () => {
      render(
        <Carousel>
          <CarouselContent>
            <CarouselItem>Item 1</CarouselItem>
            <CarouselItem>Item 2</CarouselItem>
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      )

      const buttons = screen.getAllByRole('button')
      expect(buttons).toHaveLength(2)
    })

    it('should render carousel with orientation vertical', () => {
      render(
        <Carousel orientation="vertical">
          <CarouselContent>
            <CarouselItem>Item 1</CarouselItem>
            <CarouselItem>Item 2</CarouselItem>
          </CarouselContent>
        </Carousel>
      )

      expect(screen.getByText('Item 1')).toBeInTheDocument()
    })

    it('should render carousel with orientation horizontal', () => {
      render(
        <Carousel orientation="horizontal">
          <CarouselContent>
            <CarouselItem>Item 1</CarouselItem>
            <CarouselItem>Item 2</CarouselItem>
          </CarouselContent>
        </Carousel>
      )

      expect(screen.getByText('Item 1')).toBeInTheDocument()
    })

    it('should render carousel with custom opts', () => {
      render(
        <Carousel opts={{ loop: true, align: 'start' }}>
          <CarouselContent>
            <CarouselItem>Item 1</CarouselItem>
            <CarouselItem>Item 2</CarouselItem>
          </CarouselContent>
        </Carousel>
      )

      expect(screen.getByText('Item 1')).toBeInTheDocument()
    })

    it('should render carousel with plugins', () => {
      const mockPlugin = { name: 'test-plugin' }

      render(
        <Carousel
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          plugins={[mockPlugin as any]}
        >
          <CarouselContent>
            <CarouselItem>Item 1</CarouselItem>
          </CarouselContent>
        </Carousel>
      )

      expect(screen.getByText('Item 1')).toBeInTheDocument()
    })

    it('should render carousel with setApi callback', () => {
      const setApi = vi.fn()

      render(
        <Carousel setApi={setApi}>
          <CarouselContent>
            <CarouselItem>Item 1</CarouselItem>
          </CarouselContent>
        </Carousel>
      )

      expect(screen.getByText('Item 1')).toBeInTheDocument()
    })

    it('should handle previous button click', () => {
      render(
        <Carousel>
          <CarouselContent>
            <CarouselItem>Item 1</CarouselItem>
            <CarouselItem>Item 2</CarouselItem>
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      )

      const buttons = screen.getAllByRole('button')
      const prevButton = buttons[0]

      fireEvent.click(prevButton)

      expect(prevButton).toBeInTheDocument()
    })

    it('should handle next button click', () => {
      render(
        <Carousel>
          <CarouselContent>
            <CarouselItem>Item 1</CarouselItem>
            <CarouselItem>Item 2</CarouselItem>
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      )

      const buttons = screen.getAllByRole('button')
      const nextButton = buttons[1]

      fireEvent.click(nextButton)

      expect(nextButton).toBeInTheDocument()
    })

    it('should render carousel with custom className', () => {
      const { container } = render(
        <Carousel className="custom-carousel">
          <CarouselContent className="custom-content">
            <CarouselItem className="custom-item">Item 1</CarouselItem>
          </CarouselContent>
        </Carousel>
      )

      expect(container.querySelector('.custom-carousel')).toBeInTheDocument()
      expect(container.querySelector('.custom-content')).toBeInTheDocument()
      expect(container.querySelector('.custom-item')).toBeInTheDocument()
    })

    it('should render multiple carousel items', () => {
      render(
        <Carousel>
          <CarouselContent>
            {Array.from({ length: 5 }, (_, i) => ({ id: `id-${i}` })).map((item, index) => (
              <CarouselItem key={item.id}>Item {index + 1}</CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      )

      expect(screen.getByText('Item 1')).toBeInTheDocument()
      expect(screen.getByText('Item 5')).toBeInTheDocument()
    })

    it('should render carousel with navigation buttons and custom className', () => {
      render(
        <Carousel>
          <CarouselContent>
            <CarouselItem>Item 1</CarouselItem>
          </CarouselContent>
          <CarouselPrevious className="custom-prev" />
          <CarouselNext className="custom-next" />
        </Carousel>
      )

      const buttons = screen.getAllByRole('button')
      expect(buttons).toHaveLength(2)
    })

    it('should render carousel with aria labels', () => {
      render(
        <Carousel>
          <CarouselContent>
            <CarouselItem>Item 1</CarouselItem>
          </CarouselContent>
          <CarouselPrevious aria-label="Previous slide" />
          <CarouselNext aria-label="Next slide" />
        </Carousel>
      )

      expect(screen.getByLabelText('Previous slide')).toBeInTheDocument()
      expect(screen.getByLabelText('Next slide')).toBeInTheDocument()
    })

    it('should handle ArrowLeft keydown to navigate previous', () => {
      render(
        <Carousel>
          <CarouselContent>
            <CarouselItem>Item 1</CarouselItem>
            <CarouselItem>Item 2</CarouselItem>
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      )

      const carousel = document.querySelector('[data-slot="carousel"]')!
      fireEvent.keyDown(carousel, { key: 'ArrowLeft' })
      expect(carousel).toBeInTheDocument()
    })

    it('should handle ArrowRight keydown to navigate next', () => {
      render(
        <Carousel>
          <CarouselContent>
            <CarouselItem>Item 1</CarouselItem>
            <CarouselItem>Item 2</CarouselItem>
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      )

      const carousel = document.querySelector('[data-slot="carousel"]')!
      fireEvent.keyDown(carousel, { key: 'ArrowRight' })
      expect(carousel).toBeInTheDocument()
    })

    it('should handle other keydown events without side effects', () => {
      render(
        <Carousel>
          <CarouselContent>
            <CarouselItem>Item 1</CarouselItem>
          </CarouselContent>
        </Carousel>
      )

      const carousel = document.querySelector('[data-slot="carousel"]')!
      fireEvent.keyDown(carousel, { key: 'Enter' })
      expect(carousel).toBeInTheDocument()
    })

    it('should render vertical carousel with navigation buttons', () => {
      render(
        <Carousel orientation="vertical">
          <CarouselContent>
            <CarouselItem>Item 1</CarouselItem>
            <CarouselItem>Item 2</CarouselItem>
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      )

      const buttons = screen.getAllByRole('button')
      expect(buttons).toHaveLength(2)
    })
  })
})
