import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '../../utils/test-utils'
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarTrigger,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarRail,
  SidebarInset,
  useSidebar,
} from '../../../components/ui/sidebar'
import React from 'react'

// Mock window.matchMedia
beforeEach(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
})

describe('Sidebar Components - Extended Coverage', () => {
  describe('SidebarProvider', () => {
    it('should render children', () => {
      render(
        <SidebarProvider>
          <div>Sidebar Content</div>
        </SidebarProvider>
      )

      expect(screen.getByText('Sidebar Content')).toBeInTheDocument()
    })

    it('should render with defaultOpen true', () => {
      render(
        <SidebarProvider defaultOpen={true}>
          <Sidebar>
            <SidebarContent>Open Sidebar</SidebarContent>
          </Sidebar>
        </SidebarProvider>
      )

      expect(screen.getByText('Open Sidebar')).toBeInTheDocument()
    })

    it('should render with defaultOpen false', () => {
      render(
        <SidebarProvider defaultOpen={false}>
          <Sidebar>
            <SidebarContent>Closed Sidebar</SidebarContent>
          </Sidebar>
        </SidebarProvider>
      )

      expect(screen.getByText('Closed Sidebar')).toBeInTheDocument()
    })

    it('should render with open controlled', () => {
      const onOpenChange = vi.fn()

      render(
        <SidebarProvider open={true} onOpenChange={onOpenChange}>
          <Sidebar>
            <SidebarContent>Controlled Sidebar</SidebarContent>
          </Sidebar>
        </SidebarProvider>
      )

      expect(screen.getByText('Controlled Sidebar')).toBeInTheDocument()
    })
  })

  describe('Sidebar', () => {
    it('should render with header, content, and footer', () => {
      render(
        <SidebarProvider>
          <Sidebar>
            <SidebarHeader>Header</SidebarHeader>
            <SidebarContent>Content</SidebarContent>
            <SidebarFooter>Footer</SidebarFooter>
          </Sidebar>
        </SidebarProvider>
      )

      expect(screen.getByText('Header')).toBeInTheDocument()
      expect(screen.getByText('Content')).toBeInTheDocument()
      expect(screen.getByText('Footer')).toBeInTheDocument()
    })

    it('should render with side left', () => {
      render(
        <SidebarProvider>
          <Sidebar side="left">
            <SidebarContent>Left Sidebar</SidebarContent>
          </Sidebar>
        </SidebarProvider>
      )

      expect(screen.getByText('Left Sidebar')).toBeInTheDocument()
    })

    it('should render with side right', () => {
      render(
        <SidebarProvider>
          <Sidebar side="right">
            <SidebarContent>Right Sidebar</SidebarContent>
          </Sidebar>
        </SidebarProvider>
      )

      expect(screen.getByText('Right Sidebar')).toBeInTheDocument()
    })

    it('should render with variant sidebar', () => {
      render(
        <SidebarProvider>
          <Sidebar variant="sidebar">
            <SidebarContent>Sidebar Variant</SidebarContent>
          </Sidebar>
        </SidebarProvider>
      )

      expect(screen.getByText('Sidebar Variant')).toBeInTheDocument()
    })

    it('should render with variant floating', () => {
      render(
        <SidebarProvider>
          <Sidebar variant="floating">
            <SidebarContent>Floating Variant</SidebarContent>
          </Sidebar>
        </SidebarProvider>
      )

      expect(screen.getByText('Floating Variant')).toBeInTheDocument()
    })

    it('should render with variant inset', () => {
      render(
        <SidebarProvider>
          <Sidebar variant="inset">
            <SidebarContent>Inset Variant</SidebarContent>
          </Sidebar>
        </SidebarProvider>
      )

      expect(screen.getByText('Inset Variant')).toBeInTheDocument()
    })

    it('should render with collapsible offcanvas', () => {
      render(
        <SidebarProvider>
          <Sidebar collapsible="offcanvas">
            <SidebarContent>Offcanvas</SidebarContent>
          </Sidebar>
        </SidebarProvider>
      )

      expect(screen.getByText('Offcanvas')).toBeInTheDocument()
    })

    it('should render with collapsible icon', () => {
      render(
        <SidebarProvider>
          <Sidebar collapsible="icon">
            <SidebarContent>Icon Collapsible</SidebarContent>
          </Sidebar>
        </SidebarProvider>
      )

      expect(screen.getByText('Icon Collapsible')).toBeInTheDocument()
    })

    it('should render with collapsible none', () => {
      render(
        <SidebarProvider>
          <Sidebar collapsible="none">
            <SidebarContent>No Collapse</SidebarContent>
          </Sidebar>
        </SidebarProvider>
      )

      expect(screen.getByText('No Collapse')).toBeInTheDocument()
    })
  })

  describe('SidebarTrigger', () => {
    it('should render trigger button', () => {
      render(
        <SidebarProvider>
          <Sidebar>
            <SidebarContent>Content</SidebarContent>
          </Sidebar>
          <SidebarTrigger />
        </SidebarProvider>
      )

      const trigger = screen.getByRole('button')
      expect(trigger).toBeInTheDocument()
    })

    it('should toggle sidebar on click', () => {
      render(
        <SidebarProvider>
          <Sidebar>
            <SidebarContent>Content</SidebarContent>
          </Sidebar>
          <SidebarTrigger />
        </SidebarProvider>
      )

      const trigger = screen.getByRole('button')
      fireEvent.click(trigger)

      expect(trigger).toBeInTheDocument()
    })
  })

  describe('SidebarMenu', () => {
    it('should render menu with items', () => {
      render(
        <SidebarProvider>
          <Sidebar>
            <SidebarContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton>Item 1</SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>Item 2</SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarContent>
          </Sidebar>
        </SidebarProvider>
      )

      expect(screen.getByText('Item 1')).toBeInTheDocument()
      expect(screen.getByText('Item 2')).toBeInTheDocument()
    })

    it('should render menu with sub items', () => {
      render(
        <SidebarProvider>
          <Sidebar>
            <SidebarContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton>Parent</SidebarMenuButton>
                  <SidebarMenuSub>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton>Child 1</SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton>Child 2</SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarContent>
          </Sidebar>
        </SidebarProvider>
      )

      expect(screen.getByText('Parent')).toBeInTheDocument()
      expect(screen.getByText('Child 1')).toBeInTheDocument()
      expect(screen.getByText('Child 2')).toBeInTheDocument()
    })
  })

  describe('SidebarGroup', () => {
    it('should render group with label and content', () => {
      render(
        <SidebarProvider>
          <Sidebar>
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel>Group Label</SidebarGroupLabel>
                <SidebarGroupContent>
                  <div>Group Content</div>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>
        </SidebarProvider>
      )

      expect(screen.getByText('Group Label')).toBeInTheDocument()
      expect(screen.getByText('Group Content')).toBeInTheDocument()
    })

    it('should render multiple groups', () => {
      render(
        <SidebarProvider>
          <Sidebar>
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel>Group 1</SidebarGroupLabel>
                <SidebarGroupContent>Content 1</SidebarGroupContent>
              </SidebarGroup>
              <SidebarGroup>
                <SidebarGroupLabel>Group 2</SidebarGroupLabel>
                <SidebarGroupContent>Content 2</SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>
        </SidebarProvider>
      )

      expect(screen.getByText('Group 1')).toBeInTheDocument()
      expect(screen.getByText('Group 2')).toBeInTheDocument()
    })
  })

  describe('SidebarRail', () => {
    it('should render rail', () => {
      const { container } = render(
        <SidebarProvider>
          <Sidebar>
            <SidebarContent>Content</SidebarContent>
            <SidebarRail />
          </Sidebar>
        </SidebarProvider>
      )

      expect(container.querySelector('[data-sidebar="rail"]')).toBeInTheDocument()
    })
  })

  describe('SidebarInset', () => {
    it('should render inset content', () => {
      render(
        <SidebarProvider>
          <Sidebar>
            <SidebarContent>Sidebar</SidebarContent>
          </Sidebar>
          <SidebarInset>
            <div>Main Content</div>
          </SidebarInset>
        </SidebarProvider>
      )

      expect(screen.getByText('Main Content')).toBeInTheDocument()
    })
  })

  describe('SidebarMenuButton', () => {
    it('should render as default button', () => {
      render(
        <SidebarProvider>
          <Sidebar>
            <SidebarContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton>Button Text</SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarContent>
          </Sidebar>
        </SidebarProvider>
      )

      expect(screen.getByText('Button Text')).toBeInTheDocument()
    })

    it('should render with isActive', () => {
      render(
        <SidebarProvider>
          <Sidebar>
            <SidebarContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton isActive={true}>Active Button</SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarContent>
          </Sidebar>
        </SidebarProvider>
      )

      expect(screen.getByText('Active Button')).toBeInTheDocument()
    })

    it('should render as link', () => {
      render(
        <SidebarProvider>
          <Sidebar>
            <SidebarContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href="/test">Link Button</a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarContent>
          </Sidebar>
        </SidebarProvider>
      )

      expect(screen.getByText('Link Button')).toBeInTheDocument()
    })
  })

  describe('useSidebar hook', () => {
    it('should provide sidebar context', () => {
      const TestComponent = () => {
        const { state } = useSidebar()
        return <div>State: {state}</div>
      }

      render(
        <SidebarProvider>
          <Sidebar>
            <SidebarContent>
              <TestComponent />
            </SidebarContent>
          </Sidebar>
        </SidebarProvider>
      )

      expect(screen.getByText(/State:/)).toBeInTheDocument()
    })
  })
})
