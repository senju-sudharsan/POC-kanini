import { cn } from '@/lib/utils'

interface LoadingStateProps {
  /** Number of skeleton rows/blocks to render, shaped to match the final content. */
  variant?: 'card' | 'stat' | 'table-row' | 'chart'
  count?: number
  className?: string
}

/**
 * Skeleton-first loading state. The caller picks a variant that mirrors the
 * final layout so there's no shift once data arrives (§4.5, §10.3).
 */
export function LoadingState({ variant = 'card', count = 1, className }: LoadingStateProps) {
  const items = Array.from({ length: count })

  if (variant === 'stat') {
    return (
      <div className={cn('space-y-3', className)}>
        <div className="h-3 w-24 animate-pulse rounded bg-[var(--color-surface-3)]" />
        <div className="h-9 w-32 animate-pulse rounded bg-[var(--color-surface-3)]" />
      </div>
    )
  }

  if (variant === 'table-row') {
    return (
      <div className={cn('space-y-2', className)}>
        {items.map((_, i) => (
          <div key={i} className="h-10 w-full animate-pulse rounded bg-[var(--color-surface-3)]" />
        ))}
      </div>
    )
  }

  if (variant === 'chart') {
    return (
      <div
        className={cn(
          'h-64 w-full animate-pulse rounded-[var(--radius-card)] bg-[var(--color-surface-3)]',
          className
        )}
      />
    )
  }

  return (
    <div className={cn('space-y-3', className)}>
      {items.map((_, i) => (
        <div
          key={i}
          className="h-24 w-full animate-pulse rounded-[var(--radius-card)] bg-[var(--color-surface-3)]"
        />
      ))}
    </div>
  )
}
