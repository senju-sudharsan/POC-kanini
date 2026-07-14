import type { LucideIcon } from 'lucide-react'
import { Inbox } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  className?: string
}

export function EmptyState({ icon: Icon = Inbox, title, description, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-[var(--radius-card)] border border-dashed border-[var(--color-border)] px-6 py-10 text-center',
        className
      )}
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-surface-3)]">
        <Icon className="h-4 w-4 text-[var(--color-text-muted)]" strokeWidth={1.75} />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-[var(--color-text-primary)]">{title}</p>
        {description && (
          <p className="max-w-xs text-sm text-[var(--color-text-secondary)]">{description}</p>
        )}
      </div>
    </div>
  )
}
