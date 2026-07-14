import { Users, ShoppingCart, Package, Store, CreditCard, Database, ShieldCheck, History, RefreshCw, ClipboardCheck, FileWarning } from 'lucide-react'
import { TopBar } from '@/components/layout/TopBar'
import { SummaryStatCard } from '@/features/overview/components/SummaryStatCard'
import { ArchitectureSummaryPanel } from '@/features/overview/components/ArchitectureSummaryPanel'
import { useOverviewSummary } from '@/features/overview/hooks/useOverviewSummary'
import { LoadingState } from '@/components/feedback/LoadingState'
import { ErrorState } from '@/components/feedback/ErrorState'
import { Card } from '@/components/ui/card'

const STAT_FIELDS = [
  { key: 'totalCustomers', label: 'Customers', icon: Users },
  { key: 'totalOrders', label: 'Orders', icon: ShoppingCart },
  { key: 'totalProducts', label: 'Products', icon: Package },
  { key: 'totalSellers', label: 'Sellers', icon: Store },
  { key: 'totalPayments', label: 'Payments', icon: CreditCard },
  { key: 'totalOrderFacts', label: 'Order facts', icon: Database },
] as const

const PROJECT_FEATURES = [
  { title: 'Bronze Layer', description: 'Raw source ingestion with batch lineage.', icon: Database },
  { title: 'Silver Layer', description: 'Conformed datasets for trusted operations.', icon: ShieldCheck },
  { title: 'Gold Layer', description: 'Business-ready performance aggregations.', icon: Database },
  { title: 'SCD Type 1', description: 'Current customer attributes are overwritten.', icon: RefreshCw },
  { title: 'SCD Type 2', description: 'Customer location changes retain version history.', icon: History },
  { title: 'Incremental Loading', description: 'New source batches are processed efficiently.', icon: RefreshCw },
  { title: 'Metadata Framework', description: 'Pipeline batches are governed by control metadata.', icon: ClipboardCheck },
  { title: 'Audit Framework', description: 'Warehouse counts and validation results are traceable.', icon: ShieldCheck },
  { title: 'Error Logging Framework', description: 'Pipeline exceptions are retained for operational review.', icon: FileWarning },
] as const

export function ExecutiveOverviewPage() {
  const { data, isLoading, isError, error, refetch } = useOverviewSummary()

  return (
    <div className="flex flex-1 flex-col">
      <TopBar title="Overview" description="Warehouse summary at a glance" />

      <div className="flex-1 space-y-6 p-6">
        {isLoading && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-2)] p-6"
              >
                <LoadingState variant="stat" />
              </div>
            ))}
          </div>
        )}

        {isError && (
          <ErrorState
            message={error instanceof Error ? error.message : undefined}
            onRetry={() => refetch()}
          />
        )}

        {data && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
            {STAT_FIELDS.map((field, i) => (
              <SummaryStatCard
                key={field.key}
                label={field.label}
                value={data[field.key]}
                icon={field.icon}
                index={i}
              />
            ))}
          </div>
        )}

        <ArchitectureSummaryPanel />

        <section aria-labelledby="project-features-title">
          <div className="mb-3 flex items-end justify-between gap-3">
            <div>
              <h2 id="project-features-title" className="text-base font-semibold text-[var(--color-text-primary)]">Project Features</h2>
              <p className="mt-1 text-xs text-[var(--color-text-muted)]">Implemented warehouse and operational capabilities.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
            {PROJECT_FEATURES.map(({ title, description, icon: Icon }) => (
              <Card key={title} className="min-h-32 p-4">
                <Icon className="h-4 w-4 text-[var(--color-accent-strong)]" strokeWidth={1.75} />
                <h3 className="mt-3 text-sm font-semibold text-[var(--color-text-primary)]">{title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-[var(--color-text-secondary)]">{description}</p>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
