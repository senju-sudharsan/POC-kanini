import { AlertTriangle, RotateCw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ErrorStateProps {
  /** The backend's own error.message — never a generic fallback if this exists. */
  message?: string
  onRetry?: () => void
  className?: string
}

export function ErrorState({ message, onRetry, className }: ErrorStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-2)] px-6 py-10 text-center',
        className
      )}
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-danger-soft)]">
        <AlertTriangle className="h-4 w-4 text-[var(--color-danger)]" strokeWidth={2} />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-[var(--color-text-primary)]">
          This couldn&rsquo;t load.
        </p>
        <p className="max-w-xs text-sm text-[var(--color-text-secondary)]">
          {message ?? 'The server didn&rsquo;t return a reason.'}
        </p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-1 inline-flex items-center gap-1.5 rounded-[var(--radius-control)] border border-[var(--color-border-strong)] bg-[var(--color-surface-3)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-surface-3)]/80"
        >
          <RotateCw className="h-3 w-3" strokeWidth={2} />
          Try again
        </button>
      )}
    </div>
  )
}
