import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '../../utils/test-utils'
import { Input } from '../../../components/ui/input'
import { Textarea } from '../../../components/ui/textarea'
import { Checkbox } from '../../../components/ui/checkbox'
import { Switch } from '../../../components/ui/switch'
import { Label } from '../../../components/ui/label'
import { Slider } from '../../../components/ui/slider'
import { RadioGroup, RadioGroupItem } from '../../../components/ui/radio-group'
import React from 'react'

describe('Form Components', () => {
  describe('Input', () => {
    it('should render and handle changes', () => {
      const handleChange = vi.fn()
      render(<Input placeholder="test input" onChange={handleChange} />)
      const input = screen.getByPlaceholderText('test input')
      expect(input).toBeInTheDocument()
      fireEvent.change(input, { target: { value: 'hello' } })
      expect(handleChange).toHaveBeenCalled()
    })
  })

  describe('Textarea', () => {
    it('should render and handle changes', () => {
      const handleChange = vi.fn()
      render(<Textarea placeholder="test textarea" onChange={handleChange} />)
      const textarea = screen.getByPlaceholderText('test textarea')
      expect(textarea).toBeInTheDocument()
      fireEvent.change(textarea, { target: { value: 'content' } })
      expect(handleChange).toHaveBeenCalled()
    })
  })

  describe('Checkbox', () => {
    it('should toggle state', () => {
      render(<Checkbox id="check" />)
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toBeInTheDocument()
      // Use fireEvent.click directly on the button/checkbox role
      fireEvent.click(checkbox)
      // Radix UI Checkbox adds data-state
      expect(checkbox).toHaveAttribute('data-state', 'checked')
    })
  })

  describe('Switch', () => {
    it('should toggle state', () => {
      render(<Switch role="switch" />)
      const switchEl = screen.getByRole('switch')
      expect(switchEl).toBeInTheDocument()
      fireEvent.click(switchEl)
      expect(switchEl).toHaveAttribute('data-state', 'checked')
    })
  })

  describe('Label', () => {
    it('should render correctly', () => {
      render(<Label>Test Label</Label>)
      expect(screen.getByText('Test Label')).toBeInTheDocument()
    })
  })

  describe('RadioGroup', () => {
    it('should render and handle selection', () => {
      render(
        <RadioGroup defaultValue="option-one">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="option-one" id="option-one" />
            <Label htmlFor="option-one">Option One</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="option-two" id="option-two" />
            <Label htmlFor="option-two">Option Two</Label>
          </div>
        </RadioGroup>
      )
      expect(screen.getAllByRole('radio').length).toBe(2)
      expect(screen.getAllByRole('radio')[0]).toHaveAttribute('aria-checked', 'true')
    })
  })

  describe('Slider', () => {
    it('should render', () => {
      render(<Slider defaultValue={[50]} max={100} step={1} />)
      // Radix Slider typically renders a role="slider" on the thumb
      expect(screen.getByRole('slider')).toBeInTheDocument()
    })
  })
})
