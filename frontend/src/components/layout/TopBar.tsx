import { PipelineStatusBadge } from '@/features/overview/components/PipelineStatusBadge'

interface TopBarProps {
  title: string
  description?: string
}

export function TopBar({ title, description }: TopBarProps) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface-1)] px-6">
      <div>
        <h1 className="text-sm font-semibold tracking-tight text-[var(--color-text-primary)]">
          {title}
        </h1>
        {description && (
          <p className="text-xs text-[var(--color-text-muted)]">{description}</p>
        )}
      </div>
      <PipelineStatusBadge />
    </header>
  )
}
