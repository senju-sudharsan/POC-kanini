import type { ReactNode } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export function ObservabilityHero({ eyebrow, title, description, status }: { eyebrow: string; title: string; description: string; status: string }) {
  return <section className="rounded-[var(--radius-card)] border border-red-950/70 bg-gradient-to-r from-[#2a0b0b] via-[var(--color-surface-2)] to-[var(--color-surface-2)] p-6 shadow-[0_0_32px_rgba(220,38,38,0.08)]"><p className="text-xs font-medium uppercase tracking-[0.2em] text-red-400">{eyebrow}</p><div className="mt-2 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between"><div><h2 className="text-2xl font-semibold tracking-tight text-[var(--color-text-primary)]">{title}</h2><p className="mt-1 text-sm text-[var(--color-text-secondary)]">{description}</p></div><span className="inline-flex items-center gap-2 text-xs font-medium text-red-300"><span className="h-2 w-2 rounded-full bg-red-500 shadow-[0_0_10px_#ef4444]" />{status}</span></div></section>
}

export function ObservabilityCard({ title, description, children, className }: { title: string; description: string; children: ReactNode; className?: string }) {
  return <Card className={cn('border-red-950/60 bg-gradient-to-b from-[#180f10] to-[var(--color-surface-2)] shadow-[0_10px_32px_rgba(0,0,0,0.16)]', className)}><CardHeader><div><CardTitle className="text-[var(--color-text-primary)]">{title}</CardTitle><p className="mt-1 text-xs text-[var(--color-text-muted)]">{description}</p></div></CardHeader><CardContent>{children}</CardContent></Card>
}

export function Metric({ label, value, detail }: { label: string; value: ReactNode; detail: string }) {
  return <Card className="border-red-950/60 bg-gradient-to-br from-[var(--color-surface-2)] to-[#1c1011] p-4"><p className="text-xs text-[var(--color-text-muted)]">{label}</p><p className="mt-3 text-2xl font-semibold tabular-nums text-[var(--color-text-primary)]">{value}</p><p className="mt-1 text-xs text-red-200/70">{detail}</p></Card>
}
