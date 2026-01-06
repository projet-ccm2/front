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
  SidebarSeparator,
  SidebarMenuAction,
  SidebarGroupAction,
  useSidebar,
} from '../../../components/ui/sidebar'
import React from 'react'

beforeEach(() => {
  Object.defineProperty(globalThis, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: query === '(min-width: 768px)',
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
const SidebarTestComponent = () => {
  const { state, open, setOpen, openMobile, setOpenMobile, isMobile, toggleSidebar } = useSidebar()

  return (
    <div>
      <div>State: {state}</div>
      <div>Open: {open ? 'true' : 'false'}</div>
      <div>Mobile: {isMobile ? 'true' : 'false'}</div>
      <button onClick={() => setOpen(!open)}>Toggle</button>
      <button onClick={() => setOpenMobile(!openMobile)}>Toggle Mobile</button>
      <button onClick={toggleSidebar}>Toggle Sidebar</button>
    </div>
  )
}

describe('Sidebar - Complete Coverage', () => {
  describe('SidebarProvider with all options', () => {
    it('should handle open state changes', () => {
      const onOpenChange = vi.fn()

      render(
        <SidebarProvider open={false} onOpenChange={onOpenChange}>
          <Sidebar>
            <SidebarContent>Content</SidebarContent>
          </Sidebar>
          <SidebarTrigger />
        </SidebarProvider>
      )

      const trigger = screen.getByRole('button')
      fireEvent.click(trigger)

      expect(onOpenChange).toHaveBeenCalled()
    })

    it('should work with defaultOpen false', () => {
      render(
        <SidebarProvider defaultOpen={false}>
          <Sidebar>
            <SidebarContent>Closed by default</SidebarContent>
          </Sidebar>
        </SidebarProvider>
      )

      expect(screen.getByText('Closed by default')).toBeInTheDocument()
    })

    it('should work with defaultOpen true', () => {
      render(
        <SidebarProvider defaultOpen={true}>
          <Sidebar>
            <SidebarContent>Open by default</SidebarContent>
          </Sidebar>
        </SidebarProvider>
      )

      expect(screen.getByText('Open by default')).toBeInTheDocument()
    })
  })

  describe('Sidebar variants and sides', () => {
    it('should render with side right', () => {
      render(
        <SidebarProvider>
          <Sidebar side="right">
            <SidebarContent>Right sidebar</SidebarContent>
          </Sidebar>
        </SidebarProvider>
      )

      expect(screen.getByText('Right sidebar')).toBeInTheDocument()
    })

    it('should render with variant floating', () => {
      render(
        <SidebarProvider>
          <Sidebar variant="floating">
            <SidebarContent>Floating</SidebarContent>
          </Sidebar>
        </SidebarProvider>
      )

      expect(screen.getByText('Floating')).toBeInTheDocument()
    })

    it('should render with variant inset', () => {
      render(
        <SidebarProvider>
          <Sidebar variant="inset">
            <SidebarContent>Inset</SidebarContent>
          </Sidebar>
        </SidebarProvider>
      )

      expect(screen.getByText('Inset')).toBeInTheDocument()
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
            <SidebarContent>Icon collapsible</SidebarContent>
          </Sidebar>
        </SidebarProvider>
      )

      expect(screen.getByText('Icon collapsible')).toBeInTheDocument()
    })

    it('should render with collapsible none', () => {
      render(
        <SidebarProvider>
          <Sidebar collapsible="none">
            <SidebarContent>No collapse</SidebarContent>
          </Sidebar>
        </SidebarProvider>
      )

      expect(screen.getByText('No collapse')).toBeInTheDocument()
    })
  })

  describe('SidebarMenu with all features', () => {
    it('should render menu with action', () => {
      render(
        <SidebarProvider>
          <Sidebar>
            <SidebarContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton>Item</SidebarMenuButton>
                  <SidebarMenuAction>Action</SidebarMenuAction>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarContent>
          </Sidebar>
        </SidebarProvider>
      )

      expect(screen.getByText('Item')).toBeInTheDocument()
      expect(screen.getByText('Action')).toBeInTheDocument()
    })

    it('should render menu button with tooltip', () => {
      render(
        <SidebarProvider>
          <Sidebar>
            <SidebarContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Tooltip text">Button with tooltip</SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarContent>
          </Sidebar>
        </SidebarProvider>
      )

      expect(screen.getByText('Button with tooltip')).toBeInTheDocument()
    })

    it('should render menu button with size sm', () => {
      render(
        <SidebarProvider>
          <Sidebar>
            <SidebarContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton size="sm">Small button</SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarContent>
          </Sidebar>
        </SidebarProvider>
      )

      expect(screen.getByText('Small button')).toBeInTheDocument()
    })

    it('should render menu button with size lg', () => {
      render(
        <SidebarProvider>
          <Sidebar>
            <SidebarContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton size="lg">Large button</SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarContent>
          </Sidebar>
        </SidebarProvider>
      )

      expect(screen.getByText('Large button')).toBeInTheDocument()
    })

    it('should render menu sub button with size sm', () => {
      render(
        <SidebarProvider>
          <Sidebar>
            <SidebarContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuSub>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton size="sm">Small sub</SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarContent>
          </Sidebar>
        </SidebarProvider>
      )

      expect(screen.getByText('Small sub')).toBeInTheDocument()
    })

    it('should render menu sub button with size lg', () => {
      render(
        <SidebarProvider>
          <Sidebar>
            <SidebarContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuSub>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton size="lg">Large sub</SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarContent>
          </Sidebar>
        </SidebarProvider>
      )

      expect(screen.getByText('Large sub')).toBeInTheDocument()
    })
  })

  describe('SidebarGroup with actions', () => {
    it('should render group with action', () => {
      render(
        <SidebarProvider>
          <Sidebar>
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel>Group</SidebarGroupLabel>
                <SidebarGroupAction>Action</SidebarGroupAction>
                <SidebarGroupContent>Content</SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>
        </SidebarProvider>
      )

      expect(screen.getByText('Group')).toBeInTheDocument()
      expect(screen.getByText('Action')).toBeInTheDocument()
    })

    it('should render group label as child', () => {
      render(
        <SidebarProvider>
          <Sidebar>
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel asChild>
                  <div>Custom label</div>
                </SidebarGroupLabel>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>
        </SidebarProvider>
      )

      expect(screen.getByText('Custom label')).toBeInTheDocument()
    })
  })

  describe('SidebarSeparator', () => {
    it('should render separator', () => {
      const { container } = render(
        <SidebarProvider>
          <Sidebar>
            <SidebarContent>
              <div>Content 1</div>
              <SidebarSeparator />
              <div>Content 2</div>
            </SidebarContent>
          </Sidebar>
        </SidebarProvider>
      )

      expect(container.querySelector('[data-sidebar="separator"]')).toBeInTheDocument()
    })
  })

  describe('SidebarRail', () => {
    it('should render rail and handle click', () => {
      const { container } = render(
        <SidebarProvider>
          <Sidebar>
            <SidebarContent>Content</SidebarContent>
            <SidebarRail />
          </Sidebar>
        </SidebarProvider>
      )

      const rail = container.querySelector('[data-sidebar="rail"]')
      expect(rail).toBeInTheDocument()

      if (rail) {
        fireEvent.click(rail)
      }
    })
  })

  describe('useSidebar hook', () => {
    it('should provide all sidebar state', () => {
      render(
        <SidebarProvider>
          <Sidebar>
            <SidebarContent>
              <SidebarTestComponent />
            </SidebarContent>
          </Sidebar>
        </SidebarProvider>
      )

      expect(screen.getByText(/State:/)).toBeInTheDocument()
      expect(screen.getByText(/Open:/)).toBeInTheDocument()

      const toggleButton = screen.getByText('Toggle')
      fireEvent.click(toggleButton)

      const toggleMobileButton = screen.getByText('Toggle Mobile')
      fireEvent.click(toggleMobileButton)

      const toggleSidebarButton = screen.getByText('Toggle Sidebar')
      fireEvent.click(toggleSidebarButton)
    })
  })

  describe('Complex sidebar structures', () => {
    it('should render complete sidebar with all components', () => {
      render(
        <SidebarProvider>
          <Sidebar>
            <SidebarHeader>
              <div>Header Content</div>
            </SidebarHeader>
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton isActive>Active Item</SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton>Regular Item</SidebarMenuButton>
                      <SidebarMenuSub>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton>Sub Item</SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      </SidebarMenuSub>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
              <SidebarSeparator />
              <SidebarGroup>
                <SidebarGroupLabel>Settings</SidebarGroupLabel>
                <SidebarGroupContent>
                  <div>Settings content</div>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
              <div>Footer Content</div>
            </SidebarFooter>
            <SidebarRail />
          </Sidebar>
          <SidebarInset>
            <div>Main Content</div>
          </SidebarInset>
        </SidebarProvider>
      )

      expect(screen.getByText('Header Content')).toBeInTheDocument()
      expect(screen.getByText('Active Item')).toBeInTheDocument()
      expect(screen.getByText('Sub Item')).toBeInTheDocument()
      expect(screen.getByText('Footer Content')).toBeInTheDocument()
      expect(screen.getByText('Main Content')).toBeInTheDocument()
    })
  })
})
