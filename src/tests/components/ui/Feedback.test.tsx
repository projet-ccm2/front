import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '../../utils/test-utils'
import { Alert, AlertTitle, AlertDescription } from '../../../components/ui/alert'
// sonner is usually just a Toaster component
import { Toaster } from '../../../components/ui/sonner'
import { ChartContainer } from '../../../components/ui/chart'
import { ImageWithFallback } from '../../../components/figma/ImageWithFallback'
import React from 'react'
import { vi } from 'vitest'

// Mock recharts
vi.mock('recharts', () => ({
    ResponsiveContainer: ({ children }: any) => <div data-testid="recharts-responsive">{children}</div>,
    Tooltip: () => <div data-testid="recharts-tooltip" />,
    Legend: () => <div data-testid="recharts-legend" />,
}))

describe('Feedback Components', () => {
    describe('Alert', () => {
        it('should render alert', () => {
            render(
                <Alert>
                    <AlertTitle>Heads up!</AlertTitle>
                    <AlertDescription>Something happened.</AlertDescription>
                </Alert>
            )
            expect(screen.getByText('Heads up!')).toBeInTheDocument()
            expect(screen.getByText('Something happened.')).toBeInTheDocument()
        })
    })

    describe('Sonner', () => {
        it('should render toaster', () => {
            render(<Toaster />)
            const toaster = document.querySelector('[data-sonner-toaster]') || document.querySelector('ol')
        })
    })

    describe('Chart', () => {
        it('should render chart container', () => {
            const config = {
                test: {
                    label: "Test Label",
                    color: "#000"
                }
            }
            render(
                <ChartContainer config={config} className="h-[200px]">
                    <div>Chart Content</div>
                </ChartContainer>
            )
            expect(screen.getByText('Chart Content')).toBeInTheDocument()
        })
    })

    describe('ImageWithFallback', () => {
        it('should render image', () => {
            render(<ImageWithFallback src="/test.jpg" alt="Test Image" />)
            expect(screen.getByAltText('Test Image')).toBeInTheDocument()
        })

        it('should render fallback on error', () => {
            render(<ImageWithFallback src="/broken.jpg" alt="Broken Name" />)
            const img = screen.getByAltText('Broken Name')
            fireEvent.error(img)
            expect(screen.getByAltText('Error loading image')).toBeInTheDocument()
        })
    })
})
