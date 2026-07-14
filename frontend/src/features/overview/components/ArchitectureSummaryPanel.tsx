import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { useOverviewArchitecture } from '../hooks/useOverviewSummary'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingState } from '@/components/feedback/LoadingState'
import { ErrorState } from '@/components/feedback/ErrorState'

export function ArchitectureSummaryPanel() {
  const { data, isLoading, isError, error, refetch } = useOverviewArchitecture()

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Medallion architecture</CardTitle>
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">
            Raw CSVs flow through three validated warehouse layers.
          </p>
        </div>
        <Link
          to="/medallion"
          className="inline-flex items-center gap-1 text-xs font-medium text-[var(--color-accent-strong)] hover:underline"
        >
          Explore
          <ArrowRight className="h-3 w-3" strokeWidth={2} />
        </Link>
      </CardHeader>

      <CardContent>
        {isLoading && <LoadingState variant="table-row" count={3} />}

        {isError && (
          <ErrorState message={error instanceof Error ? error.message : undefined} onRetry={() => refetch()} />
        )}

        {data && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {data.layers.map((layer, i) => (
              <motion.div
                key={layer.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18, delay: i * 0.04, ease: [0.16, 1, 0.3, 1] }}
                className="rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface-1)] p-4"
              >
                <p className="text-sm font-semibold text-[var(--color-text-primary)]">{layer.name}</p>
                <p className="mt-1 text-xs leading-relaxed text-[var(--color-text-secondary)]">
                  {layer.description}
                </p>
                <p className="mt-3 text-xs font-medium text-[var(--color-text-muted)]">
                  {layer.tableCount} tables
                </p>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
