import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '../../utils/test-utils'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
} from '../../../components/ui/dropdown-menu'
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuGroup,
  ContextMenuPortal,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuRadioGroup,
} from '../../../components/ui/context-menu'
import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarSeparator,
  MenubarLabel,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarPortal,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarGroup,
  MenubarSub,
  MenubarShortcut,
} from '../../../components/ui/menubar'
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
  DrawerClose,
} from '../../../components/ui/drawer'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '../../../components/ui/dialog'
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from '../../../components/ui/sheet'
import React from 'react'

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

describe('Menu Components - Branch Coverage', () => {
  describe('DropdownMenu all variants', () => {
    it('should render with all sub-components', () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Label</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                Item 1<DropdownMenuShortcut>⌘K</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuCheckboxItem checked>Checkbox</DropdownMenuCheckboxItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup value="1">
              <DropdownMenuRadioItem value="1">Radio 1</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="2">Radio 2</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
            <DropdownMenuSeparator />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Sub menu</DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  <DropdownMenuItem>Sub item</DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      expect(screen.getByText('Open')).toBeInTheDocument()
    })

    it('should render with inset prop', () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem inset>Inset item</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      expect(screen.getByText('Open')).toBeInTheDocument()
    })
  })

  describe('ContextMenu all variants', () => {
    it('should render with all sub-components', () => {
      render(
        <ContextMenu>
          <ContextMenuTrigger>Right click</ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuLabel>Label</ContextMenuLabel>
            <ContextMenuSeparator />
            <ContextMenuGroup>
              <ContextMenuItem>
                Item 1<ContextMenuShortcut>⌘K</ContextMenuShortcut>
              </ContextMenuItem>
              <ContextMenuCheckboxItem checked>Checkbox</ContextMenuCheckboxItem>
            </ContextMenuGroup>
            <ContextMenuSeparator />
            <ContextMenuRadioGroup value="1">
              <ContextMenuRadioItem value="1">Radio 1</ContextMenuRadioItem>
              <ContextMenuRadioItem value="2">Radio 2</ContextMenuRadioItem>
            </ContextMenuRadioGroup>
            <ContextMenuSeparator />
            <ContextMenuSub>
              <ContextMenuSubTrigger>Sub menu</ContextMenuSubTrigger>
              <ContextMenuPortal>
                <ContextMenuSubContent>
                  <ContextMenuItem>Sub item</ContextMenuItem>
                </ContextMenuSubContent>
              </ContextMenuPortal>
            </ContextMenuSub>
          </ContextMenuContent>
        </ContextMenu>
      )

      expect(screen.getByText('Right click')).toBeInTheDocument()
    })

    it('should render with inset prop', () => {
      render(
        <ContextMenu>
          <ContextMenuTrigger>Right click</ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem inset>Inset item</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      )

      expect(screen.getByText('Right click')).toBeInTheDocument()
    })
  })

  describe('Menubar all variants', () => {
    it('should render with all sub-components', () => {
      render(
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>File</MenubarTrigger>
            <MenubarContent>
              <MenubarLabel>Label</MenubarLabel>
              <MenubarSeparator />
              <MenubarGroup>
                <MenubarItem>
                  Item 1<MenubarShortcut>⌘K</MenubarShortcut>
                </MenubarItem>
                <MenubarCheckboxItem checked>Checkbox</MenubarCheckboxItem>
              </MenubarGroup>
              <MenubarSeparator />
              <MenubarRadioGroup value="1">
                <MenubarRadioItem value="1">Radio 1</MenubarRadioItem>
                <MenubarRadioItem value="2">Radio 2</MenubarRadioItem>
              </MenubarRadioGroup>
              <MenubarSeparator />
              <MenubarSub>
                <MenubarSubTrigger>Sub menu</MenubarSubTrigger>
                <MenubarPortal>
                  <MenubarSubContent>
                    <MenubarItem>Sub item</MenubarItem>
                  </MenubarSubContent>
                </MenubarPortal>
              </MenubarSub>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      )

      expect(screen.getByText('File')).toBeInTheDocument()
    })

    it('should render with inset prop', () => {
      render(
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>File</MenubarTrigger>
            <MenubarContent>
              <MenubarItem inset>Inset item</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      )

      expect(screen.getByText('File')).toBeInTheDocument()
    })
  })

  describe('Drawer all variants', () => {
    it('should render with all sub-components', () => {
      render(
        <Drawer>
          <DrawerTrigger>Open drawer</DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Title</DrawerTitle>
              <DrawerDescription>Description</DrawerDescription>
            </DrawerHeader>
            <div>Content</div>
            <DrawerFooter>
              <DrawerClose>Close</DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      )

      expect(screen.getByText('Open drawer')).toBeInTheDocument()
    })

    it('should render with direction right', () => {
      render(
        <Drawer direction="right">
          <DrawerTrigger>Open</DrawerTrigger>
          <DrawerContent>Content</DrawerContent>
        </Drawer>
      )

      expect(screen.getByText('Open')).toBeInTheDocument()
    })

    it('should render with direction left', () => {
      render(
        <Drawer direction="left">
          <DrawerTrigger>Open</DrawerTrigger>
          <DrawerContent>Content</DrawerContent>
        </Drawer>
      )

      expect(screen.getByText('Open')).toBeInTheDocument()
    })

    it('should render with direction top', () => {
      render(
        <Drawer direction="top">
          <DrawerTrigger>Open</DrawerTrigger>
          <DrawerContent>Content</DrawerContent>
        </Drawer>
      )

      expect(screen.getByText('Open')).toBeInTheDocument()
    })
  })

  describe('Dialog all variants', () => {
    it('should render with all sub-components', () => {
      render(
        <Dialog>
          <DialogTrigger>Open dialog</DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Title</DialogTitle>
              <DialogDescription>Description</DialogDescription>
            </DialogHeader>
            <div>Content</div>
            <DialogFooter>
              <DialogClose>Close</DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )

      expect(screen.getByText('Open dialog')).toBeInTheDocument()
    })
  })

  describe('Sheet all variants', () => {
    it('should render with all sub-components', () => {
      render(
        <Sheet>
          <SheetTrigger>Open sheet</SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Title</SheetTitle>
              <SheetDescription>Description</SheetDescription>
            </SheetHeader>
            <div>Content</div>
            <SheetFooter>
              <SheetClose>Close</SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      )

      expect(screen.getByText('Open sheet')).toBeInTheDocument()
    })

    it('should render with side top', () => {
      render(
        <Sheet>
          <SheetTrigger>Open</SheetTrigger>
          <SheetContent side="top">Content</SheetContent>
        </Sheet>
      )

      expect(screen.getByText('Open')).toBeInTheDocument()
    })

    it('should render with side bottom', () => {
      render(
        <Sheet>
          <SheetTrigger>Open</SheetTrigger>
          <SheetContent side="bottom">Content</SheetContent>
        </Sheet>
      )

      expect(screen.getByText('Open')).toBeInTheDocument()
    })

    it('should render with side left', () => {
      render(
        <Sheet>
          <SheetTrigger>Open</SheetTrigger>
          <SheetContent side="left">Content</SheetContent>
        </Sheet>
      )

      expect(screen.getByText('Open')).toBeInTheDocument()
    })

    it('should render with side right', () => {
      render(
        <Sheet>
          <SheetTrigger>Open</SheetTrigger>
          <SheetContent side="right">Content</SheetContent>
        </Sheet>
      )

      expect(screen.getByText('Open')).toBeInTheDocument()
    })
  })
})
