import { describe, it, expect } from 'vitest'
import { render, screen } from '../../utils/test-utils'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
  CardFooter,
} from '../../../components/ui/card'
import { Separator } from '../../../components/ui/separator'
import { ScrollArea } from '../../../components/ui/scroll-area'
import { AspectRatio } from '../../../components/ui/aspect-ratio'
import { Skeleton } from '../../../components/ui/skeleton'
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from '../../../components/ui/resizable'
import React from 'react'

describe('Layout Components', () => {
  describe('Card', () => {
    it('should render all card parts', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
          </CardHeader>
          <CardContent>Content</CardContent>
          <CardFooter>Footer</CardFooter>
        </Card>
      )
      expect(screen.getByText('Card Title')).toBeInTheDocument()
      expect(screen.getByText('Content')).toBeInTheDocument()
      expect(screen.getByText('Footer')).toBeInTheDocument()
    })

    it('should render card with description', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Title</CardTitle>
            <CardDescription>Description text</CardDescription>
          </CardHeader>
        </Card>
      )
      expect(screen.getByText('Title')).toBeInTheDocument()
      expect(screen.getByText('Description text')).toBeInTheDocument()
    })

    it('should render card with action', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Title</CardTitle>
            <CardAction>
              <button>Action</button>
            </CardAction>
          </CardHeader>
        </Card>
      )
      expect(screen.getByText('Title')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument()
    })

    it('should render complete card with all parts', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Complete Card</CardTitle>
            <CardDescription>This is a description</CardDescription>
            <CardAction>
              <button>Edit</button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <p>Main content here</p>
          </CardContent>
          <CardFooter>
            <button>Cancel</button>
            <button>Save</button>
          </CardFooter>
        </Card>
      )
      expect(screen.getByText('Complete Card')).toBeInTheDocument()
      expect(screen.getByText('This is a description')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument()
      expect(screen.getByText('Main content here')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
    })
  })

  describe('Separator', () => {
    it('should render', () => {
      render(<Separator orientation="horizontal" />)
      // Radix separator usually has role="separator" or none, checking element existence via class or just non-crash
      expect(document.querySelector('[data-orientation]') ?? document.querySelector('[role="separator"]')).toBeTruthy()
      // Separator from radix usually has role separator.
      // If not found, it might be the way it's rendered in JSDOM or component impl.
      // Let's check simply that it renders without error for now if role is missing.
      // But testing library recommends byRole.
    })
  })

  describe('ScrollArea', () => {
    it('should render content', () => {
      render(
        <ScrollArea className="h-[200px] w-[350px]">
          <div>Scrollable Content</div>
        </ScrollArea>
      )
      expect(screen.getByText('Scrollable Content')).toBeInTheDocument()
    })
  })

  describe('AspectRatio', () => {
    it('should render children with ratio', () => {
      render(
        <AspectRatio ratio={16 / 9}>
          <img src="test.jpg" alt="test" />
        </AspectRatio>
      )
      expect(screen.getByAltText('test')).toBeInTheDocument()
    })
  })

  describe('Skeleton', () => {
    it('should render', () => {
      render(<Skeleton className="w-[100px] h-[20px]" />)
      // Usually just a div with class
      const skeleton = document.querySelector('.animate-pulse')
      expect(skeleton).toBeInTheDocument()
    })
  })

  describe('Resizable', () => {
    it('should render panels', () => {
      render(
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel defaultSize={50}>
            <div>Panel One</div>
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel defaultSize={50}>
            <div>Panel Two</div>
          </ResizablePanel>
        </ResizablePanelGroup>
      )
      expect(screen.getByText('Panel One')).toBeInTheDocument()
      expect(screen.getByText('Panel Two')).toBeInTheDocument()
    })
  })
})
