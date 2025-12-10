import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent, waitFor } from '../../utils/test-utils'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '../../../components/ui/breadcrumb'
import { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuTrigger, NavigationMenuContent, NavigationMenuLink } from '../../../components/ui/navigation-menu'
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext, PaginationEllipsis } from '../../../components/ui/pagination'
import { Menubar, MenubarMenu, MenubarTrigger, MenubarContent, MenubarItem, MenubarSeparator } from '../../../components/ui/menubar'
import { SidebarProvider, Sidebar, SidebarContent, SidebarTrigger, SidebarHeader, SidebarFooter } from '../../../components/ui/sidebar'
import React from 'react'

// Mock ResizeObserver for Sidebar
if (typeof window !== 'undefined') {
    global.ResizeObserver = class ResizeObserver {
        observe() { }
        unobserve() { }
        disconnect() { }
    }
}

describe('Navigation Components', () => {
    describe('Breadcrumb', () => {
        it('should render breadcrumb trail', () => {
            render(
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/">Home</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>Current Page</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            )
            expect(screen.getByText('Home')).toBeInTheDocument()
            expect(screen.getByText('Current Page')).toBeInTheDocument()
        })
    })

    describe('NavigationMenu', () => {
        it('should render menu structure', () => {
            render(
                <NavigationMenu>
                    <NavigationMenuList>
                        <NavigationMenuItem>
                            <NavigationMenuTrigger>Item One</NavigationMenuTrigger>
                            <NavigationMenuContent>
                                <NavigationMenuLink>Link One</NavigationMenuLink>
                            </NavigationMenuContent>
                        </NavigationMenuItem>
                    </NavigationMenuList>
                </NavigationMenu>
            )
            expect(screen.getByText('Item One')).toBeInTheDocument()
        })
    })

    describe('Pagination', () => {
        it('should render pagination controls', () => {
            render(
                <Pagination>
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious href="#" />
                        </PaginationItem>
                        <PaginationItem>
                            <PaginationLink href="#">1</PaginationLink>
                        </PaginationItem>
                        <PaginationItem>
                            <PaginationEllipsis />
                        </PaginationItem>
                        <PaginationItem>
                            <PaginationNext href="#" />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            )
            expect(screen.getByText('1')).toBeInTheDocument()
            expect(screen.getByText('More pages')).toBeInTheDocument() // Ellipsis traditionally has sr-only text or visible dots
        })
    })

    describe('Menubar', () => {
        it('should render menubar', async () => {
            render(
                <Menubar>
                    <MenubarMenu>
                        <MenubarTrigger>File</MenubarTrigger>
                        <MenubarContent>
                            <MenubarItem>New Tab</MenubarItem>
                            <MenubarSeparator />
                            <MenubarItem>Print</MenubarItem>
                        </MenubarContent>
                    </MenubarMenu>
                </Menubar>
            )
            expect(screen.getByText('File')).toBeInTheDocument()
            fireEvent.click(screen.getByText('File'))
            await waitFor(() => {
                expect(screen.getByText('New Tab')).toBeInTheDocument()
            })
        })
    })

    describe('UI Sidebar (Primitive)', () => {
        it('should render sidebar primitive structure', () => {
            render(
                <SidebarProvider>
                    <Sidebar>
                        <SidebarHeader>Header</SidebarHeader>
                        <SidebarContent>Content</SidebarContent>
                        <SidebarFooter>Footer</SidebarFooter>
                    </Sidebar>
                    <main>
                        <SidebarTrigger />
                    </main>
                </SidebarProvider>
            )
            expect(screen.getByText('Header')).toBeInTheDocument()
            expect(screen.getByText('Content')).toBeInTheDocument()
            expect(screen.getByText('Footer')).toBeInTheDocument()
        })
    })
})
