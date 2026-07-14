import type { LucideIcon } from 'lucide-react'

interface PageStubProps {
  icon: LucideIcon
  phaseLabel: string
}

export function PageStub({ icon: Icon, phaseLabel }: PageStubProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-20 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-surface-2)] border border-[var(--color-border)]">
        <Icon className="h-4.5 w-4.5 text-[var(--color-text-muted)]" strokeWidth={1.75} />
      </div>
      <p className="text-sm font-medium text-[var(--color-text-primary)]">Not built yet</p>
      <p className="max-w-sm text-sm text-[var(--color-text-secondary)]">
        This page ships in {phaseLabel}, once its endpoints in API_CONTRACT.md are wired up.
      </p>
    </div>
  )
}
