import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Boxes,
  Activity,
  BarChart3,
  ShieldCheck,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { to: '/overview', label: 'Overview', icon: LayoutDashboard },
  { to: '/medallion', label: 'Dataset Explorer', icon: Boxes },
  { to: '/pipeline', label: 'Pipeline Health', icon: Activity },
  { to: '/analytics', label: 'Business Intelligence', icon: BarChart3 },
  { to: '/quality', label: 'Data Quality', icon: ShieldCheck },
] as const

export function Sidebar() {
  return (
    <aside className="hidden min-h-screen w-60 shrink-0 flex-col border-r border-[var(--color-border)] bg-[var(--color-surface-1)] md:flex">
      <div className="flex h-14 items-center gap-2.5 px-5">
        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[var(--color-accent)]">
          <div className="h-2 w-2 rounded-sm bg-white" />
        </div>
        <span className="text-sm font-semibold tracking-tight text-[var(--color-text-primary)]">
          POC
        </span>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 px-3 py-2">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2.5 rounded-[var(--radius-control)] px-2.5 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-[var(--color-accent-soft)] text-[var(--color-accent-strong)]'
                  : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text-primary)]'
              )
            }
          >
            <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-[var(--color-border)] px-5 py-4">
        <p className="text-xs leading-relaxed text-[var(--color-text-muted)]">
          CSV → Bronze → Silver → Gold
        </p>
      </div>
    </aside>
  )
}
