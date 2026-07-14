import { Link, useParams } from 'react-router-dom'
import { TopBar } from '@/components/layout/TopBar'
import { ErrorState } from '@/components/feedback/ErrorState'
import { LoadingState } from '@/components/feedback/LoadingState'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/ui/status-badge'
import { useBatchDetail } from '@/features/pipeline/hooks/useBatchDetail'
import { useBatchHistory } from '@/features/pipeline/hooks/useBatchHistory'
import { useLatestBatch } from '@/features/pipeline/hooks/useLatestBatch'
import { formatAbsoluteTime, formatDuration, formatNumber } from '@/lib/formatters'

const PIPELINE_FEATURES = [
  { title: 'Incremental Loading', description: 'Processes newly arrived customer source batches.' },
  { title: 'Metadata Framework', description: 'Tracks batch timing, status, and processing volumes.' },
  { title: 'Audit Framework', description: 'Validates warehouse records and layer-level outcomes.' },
  { title: 'Error Logging Framework', description: 'Captures failed runs for investigation and recovery.' },
] as const

export function PipelineHealthPage() {
  const { batchId } = useParams()
  const latestBatch = useLatestBatch()
  const batchHistory = useBatchHistory()
  const selectedBatchId = batchId ?? latestBatch.data?.batchId
  const batchDetail = useBatchDetail(selectedBatchId)

  return (
    <div className="flex min-h-screen min-w-0 flex-col">
      <TopBar title="Pipeline Health" description="Batch runs, duration, and validation status" />
      <div className="flex-1 space-y-6 p-6 pb-6">
        <Card>
          <CardHeader><div><CardTitle>Latest batch</CardTitle><p className="mt-1 text-xs text-[var(--color-text-muted)]">Automatically refreshed every minute.</p></div></CardHeader>
          <CardContent>
            {latestBatch.isLoading && <LoadingState variant="card" />}
            {latestBatch.isError && <ErrorState message={latestBatch.error instanceof Error ? latestBatch.error.message : undefined} onRetry={() => latestBatch.refetch()} />}
            {latestBatch.data && <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5"><div><p className="text-xs text-[var(--color-text-muted)]">Batch</p><p className="mt-1 font-mono text-sm text-[var(--color-text-primary)]">{latestBatch.data.batchId}</p></div><div><p className="text-xs text-[var(--color-text-muted)]">Run status</p><div className="mt-1"><StatusBadge status={latestBatch.data.status} /></div></div><div><p className="text-xs text-[var(--color-text-muted)]">Duration</p><p className="mt-1 text-sm text-[var(--color-text-primary)]">{formatDuration(latestBatch.data.durationSeconds)}</p></div><div><p className="text-xs text-[var(--color-text-muted)]">Rows processed</p><p className="mt-1 tabular-nums text-sm text-[var(--color-text-primary)]">{formatNumber(latestBatch.data.rowsProcessed)}</p></div><div><p className="text-xs text-[var(--color-text-muted)]">Validation</p><div className="mt-1"><StatusBadge status={latestBatch.data.validationStatus} /></div></div></div>}
          </CardContent>
        </Card>

        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Pipeline capabilities">
          {PIPELINE_FEATURES.map((feature) => (
            <Card key={feature.title} className="min-h-28 p-4">
              <CardTitle className="text-[var(--color-text-primary)]">{feature.title}</CardTitle>
              <p className="mt-2 text-xs leading-relaxed text-[var(--color-text-secondary)]">{feature.description}</p>
            </Card>
          ))}
        </section>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
          <Card>
            <CardHeader><div><CardTitle>Batch history</CardTitle><p className="mt-1 text-xs text-[var(--color-text-muted)]">Most recent backend-reported batch runs.</p></div></CardHeader>
            <CardContent>
              {batchHistory.isLoading && <LoadingState variant="table-row" count={6} />}
              {batchHistory.isError && <ErrorState message={batchHistory.error instanceof Error ? batchHistory.error.message : undefined} onRetry={() => batchHistory.refetch()} />}
              {batchHistory.data && <div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm"><thead className="border-b border-[var(--color-border)] text-xs text-[var(--color-text-muted)]"><tr><th className="pb-3 font-medium">Batch</th><th className="pb-3 font-medium">Started</th><th className="pb-3 font-medium">Run</th><th className="pb-3 text-right font-medium">Duration</th><th className="pb-3 text-right font-medium">Rows</th><th className="pb-3 font-medium">Validation</th></tr></thead><tbody className="divide-y divide-[var(--color-border)]">{batchHistory.data.batches.map((batch) => <tr key={batch.batchId} className="text-[var(--color-text-secondary)]"><td className="py-3 font-mono text-xs font-medium text-[var(--color-accent-strong)]"><Link to={`/pipeline/batches/${encodeURIComponent(batch.batchId)}`} className="hover:underline">{batch.batchId}</Link></td><td className="py-3 text-xs">{formatAbsoluteTime(batch.startedAt)}</td><td className="py-3"><StatusBadge status={batch.status} /></td><td className="py-3 text-right tabular-nums">{formatDuration(batch.durationSeconds)}</td><td className="py-3 text-right tabular-nums">{formatNumber(batch.rowsProcessed)}</td><td className="py-3"><StatusBadge status={batch.validationStatus} /></td></tr>)}</tbody></table></div>}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><div><CardTitle>Batch Summary</CardTitle><p className="mt-1 text-xs text-[var(--color-text-muted)]">{batchId ? `Selected batch ${batchId}.` : 'Detail for the latest batch.'}</p></div></CardHeader>
            <CardContent>
              {batchDetail.isLoading && <LoadingState variant="table-row" count={6} />}
              {batchDetail.isError && <ErrorState message={batchDetail.error instanceof Error ? batchDetail.error.message : undefined} onRetry={() => batchDetail.refetch()} />}
              {batchDetail.data && <div className="space-y-5"><div className="grid grid-cols-2 gap-x-5 gap-y-4 text-sm"><div><p className="text-xs text-[var(--color-text-muted)]">Batch ID</p><p className="mt-1 truncate font-mono text-xs text-[var(--color-text-primary)]">{batchDetail.data.batchId}</p></div><div><p className="text-xs text-[var(--color-text-muted)]">Status</p><div className="mt-1"><StatusBadge status={batchDetail.data.status} /></div></div><div><p className="text-xs text-[var(--color-text-muted)]">Validation</p><div className="mt-1"><StatusBadge status={batchDetail.data.validationStatus} /></div></div><div><p className="text-xs text-[var(--color-text-muted)]">Duration</p><p className="mt-1 tabular-nums text-[var(--color-text-primary)]">{formatDuration(batchDetail.data.durationSeconds)}</p></div><div><p className="text-xs text-[var(--color-text-muted)]">Started</p><p className="mt-1 text-xs text-[var(--color-text-primary)]">{formatAbsoluteTime(batchDetail.data.startedAt)}</p></div><div><p className="text-xs text-[var(--color-text-muted)]">Finished</p><p className="mt-1 text-xs text-[var(--color-text-primary)]">{formatAbsoluteTime(batchDetail.data.finishedAt)}</p></div><div className="col-span-2"><p className="text-xs text-[var(--color-text-muted)]">Rows processed</p><p className="mt-1 tabular-nums text-lg font-medium text-[var(--color-text-primary)]">{formatNumber(batchDetail.data.rowsProcessed)}</p></div></div><div className="border-t border-[var(--color-border)] pt-4"><p className="mb-3 text-xs font-medium uppercase tracking-wider text-[var(--color-text-muted)]">Pipeline destination</p><div className="flex items-center justify-between gap-1 text-center text-xs"><div className="min-w-0 flex-1"><span className="block rounded bg-[var(--color-surface-3)] px-2 py-2 text-[var(--color-text-secondary)]">CSV</span></div><span className="text-[var(--color-text-muted)]">→</span><div className="min-w-0 flex-1"><span className="block rounded bg-[#3a1c20] px-2 py-2 text-red-200">Bronze</span></div><span className="text-[var(--color-text-muted)]">→</span><div className="min-w-0 flex-1"><span className="block rounded bg-[#542022] px-2 py-2 text-red-100">Silver</span></div><span className="text-[var(--color-text-muted)]">→</span><div className="min-w-0 flex-1"><span className="block rounded bg-[#7F1D1D] px-2 py-2 font-medium text-white">Gold</span></div></div></div></div>}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
