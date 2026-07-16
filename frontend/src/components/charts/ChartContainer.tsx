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
  content: <RichChartTooltip />,
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

/** Premium, context-rich default tooltip shared by dashboard visualizations. */
export function RichChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name?: string; value?: string | number; color?: string }>; label?: string | number }) {
  if (!active || !payload?.length) return null
  return <div className="min-w-40 rounded-lg border border-red-950/80 bg-[#160d0f] px-3 py-2.5 shadow-[0_12px_28px_rgba(0,0,0,.38)]"><p className="border-b border-red-950/60 pb-2 text-xs font-semibold text-red-100">{label ?? 'Observation'}</p><div className="space-y-1.5 pt-2">{payload.map((entry, index) => <div key={`${entry.name}-${index}`} className="flex items-center justify-between gap-5 text-xs"><span className="flex items-center gap-2 text-[var(--color-text-secondary)]"><i className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color ?? '#F97316' }} />{entry.name}</span><span className="font-medium tabular-nums text-[var(--color-text-primary)]">{typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}</span></div>)}</div></div>
}

export const chartColors = [
  'var(--color-chart-1)',
  'var(--color-chart-2)',
  'var(--color-chart-3)',
  'var(--color-chart-4)',
  'var(--color-chart-5)',
]
