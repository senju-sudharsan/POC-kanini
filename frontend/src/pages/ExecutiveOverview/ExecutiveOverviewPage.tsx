import { Users, ShoppingCart, Package, Store, CreditCard, Database } from 'lucide-react'
import { TopBar } from '@/components/layout/TopBar'
import { SummaryStatCard } from '@/features/overview/components/SummaryStatCard'
import { ArchitectureSummaryPanel } from '@/features/overview/components/ArchitectureSummaryPanel'
import { useOverviewSummary } from '@/features/overview/hooks/useOverviewSummary'
import { LoadingState } from '@/components/feedback/LoadingState'
import { ErrorState } from '@/components/feedback/ErrorState'

const STAT_FIELDS = [
  { key: 'totalCustomers', label: 'Customers', icon: Users },
  { key: 'totalOrders', label: 'Orders', icon: ShoppingCart },
  { key: 'totalProducts', label: 'Products', icon: Package },
  { key: 'totalSellers', label: 'Sellers', icon: Store },
  { key: 'totalPayments', label: 'Payments', icon: CreditCard },
  { key: 'totalOrderFacts', label: 'Order facts', icon: Database },
] as const

export function ExecutiveOverviewPage() {
  const { data, isLoading, isError, error, refetch } = useOverviewSummary()

  return (
    <div className="flex flex-1 flex-col">
      <TopBar title="Overview" description="Warehouse summary at a glance" />

      <div className="flex-1 space-y-6 p-6">
        {isLoading && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
      </div>
    </div>
  )
}
