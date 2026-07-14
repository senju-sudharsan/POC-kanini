import type { ReactNode } from 'react'
import { ResponsiveContainer } from 'recharts'
import { EmptyState } from '@/components/feedback/EmptyState'
import { cn } from '@/lib/utils'

interface ChartContainerProps {
  children: ReactNode
  height?: number
  isEmpty?: boolean
  emptyTitle?: string
  emptyDescription?: string
  className?: string
}

/**
 * Wraps every Recharts chart in the app so tooltip styling, sizing, and the
 * empty-result case stay consistent (design system §4.5, §10.4).
 */
export function ChartContainer({
  children,
  height = 280,
  isEmpty,
  emptyTitle = 'No data yet',
  emptyDescription = 'This chart will populate once the pipeline has run.',
  className,
}: ChartContainerProps) {
  if (isEmpty) {
    return (
      <div className={cn('w-full', className)} style={{ height }}>
        <EmptyState title={emptyTitle} description={emptyDescription} className="h-full" />
      </div>
    )
  }

  return (
    <div className={cn('w-full', className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        {children as never}
      </ResponsiveContainer>
    </div>
  )
}

/** Shared tooltip style props, spread onto every Recharts <Tooltip /> instance. */
export const chartTooltipStyle = {
  contentStyle: {
    backgroundColor: 'var(--color-surface-3)',
    border: '1px solid var(--color-border-strong)',
    borderRadius: '8px',
    fontSize: '12px',
    color: 'var(--color-text-primary)',
  },
  labelStyle: {
    color: 'var(--color-text-secondary)',
  },
  cursor: { fill: 'var(--color-surface-3)', opacity: 0.4 },
}

export const chartColors = [
  'var(--color-chart-1)',
  'var(--color-chart-2)',
  'var(--color-chart-3)',
  'var(--color-chart-4)',
  'var(--color-chart-5)',
]
