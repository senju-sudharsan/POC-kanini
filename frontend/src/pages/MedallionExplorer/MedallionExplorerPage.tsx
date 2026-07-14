import { Link, useParams } from 'react-router-dom'
import { TopBar } from '@/components/layout/TopBar'
import { EmptyState } from '@/components/feedback/EmptyState'
import { ErrorState } from '@/components/feedback/ErrorState'
import { LoadingState } from '@/components/feedback/LoadingState'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/ui/status-badge'
import { useLayerTableDetail } from '@/features/medallion/hooks/useLayerTableDetail'
import { useMedallionLayers } from '@/features/medallion/hooks/useMedallionLayers'
import { formatNumber } from '@/lib/formatters'

export function MedallionExplorerPage() {
  const { layerId, tableName } = useParams()
  const layers = useMedallionLayers()
  const tableDetail = useLayerTableDetail(layerId, tableName)
  return (
    <div className="flex flex-1 flex-col">
      <TopBar title="Medallion Architecture Explorer" description="CSV → Bronze → Silver → Gold → Insights" />
      <div className="flex-1 space-y-6 p-6">
        {layers.isLoading && <LoadingState variant="card" count={3} />}
        {layers.isError && <ErrorState message={layers.error instanceof Error ? layers.error.message : undefined} onRetry={() => layers.refetch()} />}
        {layers.data && <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">{layers.data.layers.map((layer) => <Card key={layer.id} className="flex flex-col"><CardHeader><div><CardTitle>{layer.name}</CardTitle><p className="mt-1 text-xs leading-relaxed text-[var(--color-text-muted)]">{layer.purpose}</p></div></CardHeader><CardContent className="flex flex-1 flex-col"><div className="divide-y divide-[var(--color-border)]">{layer.tables.map((table) => <Link key={table.name} to={`/medallion/${encodeURIComponent(layer.id)}/${encodeURIComponent(table.name)}`} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0 hover:text-[var(--color-accent-strong)]"><span className="font-mono text-xs text-[var(--color-text-primary)]">{table.name}</span><span className="shrink-0 text-xs tabular-nums text-[var(--color-text-muted)]">{formatNumber(table.rowCount)} rows</span></Link>)}</div></CardContent></Card>)}</div>}

        {(layerId || tableName) && <Card><CardHeader><div><CardTitle>Table detail</CardTitle><p className="mt-1 font-mono text-xs text-[var(--color-text-muted)]">{layerId}/{tableName}</p></div></CardHeader><CardContent>
          {tableDetail.isLoading && <LoadingState variant="table-row" count={4} />}
          {tableDetail.isError && <ErrorState message={tableDetail.error instanceof Error ? tableDetail.error.message : undefined} onRetry={() => tableDetail.refetch()} />}
          {tableDetail.data && <div className="grid grid-cols-1 gap-6 lg:grid-cols-3"><div><p className="text-xs text-[var(--color-text-muted)]">Rows</p><p className="mt-1 tabular-nums text-2xl font-semibold text-[var(--color-text-primary)]">{formatNumber(tableDetail.data.rowCount)}</p><p className="mt-4 text-xs text-[var(--color-text-muted)]">Validation</p><div className="mt-1"><StatusBadge status={tableDetail.data.validation.status} /></div><p className="mt-2 text-xs text-[var(--color-text-secondary)]">{formatNumber(tableDetail.data.validation.checksPassed)} of {formatNumber(tableDetail.data.validation.checksRun)} checks passed</p></div><div><p className="text-xs font-medium text-[var(--color-text-muted)]">Source tables</p><ul className="mt-2 space-y-2">{tableDetail.data.sourceTables.map((source) => <li key={source} className="font-mono text-xs text-[var(--color-text-primary)]">{source}</li>)}</ul></div><div><p className="text-xs font-medium text-[var(--color-text-muted)]">Transformations</p><div className="mt-2 space-y-3">{tableDetail.data.transformations.map((transformation) => <div key={transformation.step}><p className="text-sm text-[var(--color-text-primary)]">{transformation.step}</p><p className="mt-0.5 text-xs leading-relaxed text-[var(--color-text-secondary)]">{transformation.description}</p></div>)}</div></div></div>}
        </CardContent></Card>}

        {layers.data && layers.data.layers.length === 0 && <EmptyState title="No medallion layers available" description="Layers will appear once warehouse metadata is available." />}
      </div>
    </div>
  )
}
