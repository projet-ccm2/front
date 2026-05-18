import { describe, it, expect } from 'vitest'
import { render, screen, renderHook, fireEvent } from '../../utils/test-utils'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../../components/ui/tabs'
import { Toggle } from '../../../components/ui/toggle'
import { Button } from '../../../components/ui/button'
import { useIsMobile } from '../../../components/ui/use-mobile'
import { cn } from '../../../components/ui/utils'
import React from 'react'

describe('Remaining UI Components', () => {
  describe('Button', () => {
    it('should render button', () => {
      render(<Button>Click me</Button>)
      expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
    })

    it('should render variants', () => {
      render(<Button variant="destructive">Destructive</Button>)
      const btn = screen.getByRole('button', { name: /destructive/i })
      expect(btn).toBeInTheDocument()
      expect(btn.className).toContain('bg-destructive')
    })
  })

  describe('Tabs', () => {
    it('should render correct initial state', () => {
      render(
        <Tabs defaultValue="tab1" className="w-[400px]">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>
      )

      // Check if active tab content is visible and inactive is not (or simply structure presence)
      // Radix usually unmounts inactive content.
      expect(screen.getByText('Content 1')).toBeInTheDocument()

      const trigger1 = screen.getByRole('tab', { name: 'Tab 1' })
      expect(trigger1).toHaveAttribute('data-state', 'active')
    })
  })

  describe('Toggle', () => {
    it('should toggle state', () => {
      render(<Toggle aria-label="Toggle italic">Italic</Toggle>)
      const button = screen.getByLabelText('Toggle italic')
      expect(button).toBeInTheDocument()
      fireEvent.click(button)
      expect(button).toHaveAttribute('data-state', 'on')
      fireEvent.click(button)
      expect(button).toHaveAttribute('data-state', 'off')
    })
  })

  describe('useIsMobile', () => {
    it('should detect mobile breakpoint', () => {
      // Mock matchMedia
      window.matchMedia = query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      })

      const { result } = renderHook(() => useIsMobile())
      expect(result.current).toBe(false)
    })
  })

  describe('utils', () => {
    it('cn should merge classes', () => {
      const result = cn('c1', 'c2')
      expect(result).toBe('c1 c2')
    })

    it('cn should handle conditionals', () => {
      const t = true
      const f = false
      const result = cn('c1', t && 'c2', f && 'c3')
      expect(result).toBe('c1 c2')
    })

    it('cn should merge tailwind classes', () => {
      const result = cn('p-4', 'p-2')
      expect(result).toBe('p-2')
    })
  })
})
