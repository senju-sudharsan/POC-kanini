import { ArrowDown, Check, ChevronDown, GitBranch } from 'lucide-react'
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
    <div className="flex min-h-screen min-w-0 flex-col">
      <TopBar title="Dataset Explorer" description="CSV → Bronze → Silver → Gold → Insights" />

      <div className="flex-1 space-y-6 p-6 pb-6">
        {layers.isLoading && <LoadingState variant="card" count={3} />}
        {layers.isError && (
          <ErrorState
            message={layers.error instanceof Error ? layers.error.message : undefined}
            onRetry={() => layers.refetch()}
          />
        )}
        {layers.data && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-4">
            {layers.data.layers.map((layer) => (
              <Card key={layer.id} className="flex flex-col">
                <CardHeader>
                  <div>
                    <CardTitle>{layer.name}</CardTitle>
                    <p className="mt-1 text-xs leading-relaxed text-[var(--color-text-muted)]">
                      {layer.purpose}
                    </p>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col">
                  <div className="divide-y divide-[var(--color-border)]">
                    {layer.tables.map((table) => (
                      <Link
                        key={table.name}
                        to={`/medallion/${encodeURIComponent(layer.id)}/${encodeURIComponent(table.name)}`}
                        className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0 hover:text-[var(--color-accent-strong)]"
                      >
                        <span className="font-mono text-xs text-[var(--color-text-primary)]">
                          {table.name}
                        </span>
                        <span className="shrink-0 text-xs tabular-nums text-[var(--color-text-muted)]">
                          {formatNumber(table.rowCount)} rows
                        </span>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
            <Card className="flex flex-col">
              <CardHeader>
                <div>
                  <CardTitle>Business Transformations</CardTitle>
                  <p className="mt-1 text-xs leading-relaxed text-[var(--color-text-muted)]">
                    The governed transformations that make warehouse datasets ready for business use.
                  </p>
                </div>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col">
                <div className="space-y-3 text-sm">
                  <div><p className="font-medium text-[var(--color-text-primary)]">Conformance</p><p className="mt-0.5 text-xs text-[var(--color-text-secondary)]">Standardize source fields into trusted Silver datasets.</p></div>
                  <div><p className="font-medium text-[var(--color-text-primary)]">History management</p><p className="mt-0.5 text-xs text-[var(--color-text-secondary)]">Preserve customer changes through SCD processing.</p></div>
                  <div><p className="font-medium text-[var(--color-text-primary)]">Analytics aggregation</p><p className="mt-0.5 text-xs text-[var(--color-text-secondary)]">Publish business-ready Gold performance metrics.</p></div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {(layerId || tableName) && (
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Table detail</CardTitle>
                <p className="mt-1 font-mono text-xs text-[var(--color-text-muted)]">
                  {layerId}/{tableName}
                </p>
              </div>
            </CardHeader>
            <CardContent>
              {tableDetail.isLoading && <LoadingState variant="table-row" count={5} />}
              {tableDetail.isError && (
                <ErrorState
                  message={tableDetail.error instanceof Error ? tableDetail.error.message : undefined}
                  onRetry={() => tableDetail.refetch()}
                />
              )}
              {tableDetail.data && (
                <div className="space-y-5">
                  <div className="rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface-1)] p-4">
                    <p className="text-xs font-medium text-[var(--color-text-muted)]">Table purpose</p>
                    <p className="mt-1 text-sm leading-relaxed text-[var(--color-text-primary)]">
                      {tableDetail.data.purpose}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
                    <div className="rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface-1)] p-4">
                      <div className="flex items-center gap-2">
                        <GitBranch className="h-4 w-4 text-[var(--color-accent-strong)]" strokeWidth={1.75} />
                        <p className="text-xs font-medium text-[var(--color-text-muted)]">Data journey</p>
                      </div>
                      <div className="mt-3 space-y-1">
                        {tableDetail.data.lineageJourney.map((node, index) => (
                          <div key={`${node}-${index}`} className="flex flex-col items-start">
                            <span className="rounded border border-[var(--color-border)] bg-[var(--color-surface-2)] px-2 py-1 font-mono text-xs text-[var(--color-text-primary)]">
                              {node}
                            </span>
                            {index < tableDetail.data.lineageJourney.length - 1 && (
                              <ArrowDown className="my-1 ml-2 h-3 w-3 text-[var(--color-text-muted)]" strokeWidth={1.75} />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface-1)] p-4">
                      <p className="text-xs font-medium text-[var(--color-text-muted)]">Rows</p>
                      <p className="mt-1 tabular-nums text-2xl font-semibold text-[var(--color-text-primary)]">
                        {formatNumber(tableDetail.data.rowCount)}
                      </p>
                      <p className="mt-4 text-xs font-medium text-[var(--color-text-muted)]">Validation</p>
                      <div className="mt-1">
                        <StatusBadge status={tableDetail.data.validation.status} />
                      </div>
                      <p className="mt-2 text-xs text-[var(--color-text-secondary)]">
                        {formatNumber(tableDetail.data.validation.checksPassed)} of{' '}
                        {formatNumber(tableDetail.data.validation.checksRun)} checks passed
                      </p>
                    </div>

                    <div className="rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface-1)] p-4">
                      <p className="text-xs font-medium text-[var(--color-text-muted)]">Source tables</p>
                      {tableDetail.data.sourceTables.length > 0 ? (
                        <ul className="mt-2 space-y-2">
                          {tableDetail.data.sourceTables.map((source) => (
                            <li key={source} className="font-mono text-xs text-[var(--color-text-primary)]">
                              {source}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mt-2 text-xs leading-relaxed text-[var(--color-text-secondary)]">
                          No upstream warehouse table; this is an ingested source dataset.
                        </p>
                      )}
                    </div>

                    <div className="rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface-1)] p-4">
                      <p className="text-xs font-medium text-[var(--color-text-muted)]">Transformations</p>
                      <div className="mt-2 space-y-3">
                        {tableDetail.data.transformations.map((transformation) => (
                          <div key={transformation.step}>
                            <p className="text-sm text-[var(--color-text-primary)]">{transformation.step}</p>
                            <p className="mt-0.5 text-xs leading-relaxed text-[var(--color-text-secondary)]">
                              {transformation.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <details className="group rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface-1)]">
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4 text-sm font-medium text-[var(--color-text-primary)]">
                        View Business Context
                        <ChevronDown className="h-4 w-4 text-[var(--color-text-muted)] transition-transform group-open:rotate-180" strokeWidth={1.75} />
                      </summary>
                      <div className="space-y-4 border-t border-[var(--color-border)] p-4 text-sm">
                        <div>
                          <p className="text-xs font-medium text-[var(--color-text-muted)]">Business value</p>
                          <p className="mt-1 leading-relaxed text-[var(--color-text-secondary)]">{tableDetail.data.businessValue}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-[var(--color-text-muted)]">Consumers</p>
                          <ul className="mt-2 space-y-1.5 text-[var(--color-text-secondary)]">
                            {tableDetail.data.consumers.map((consumer) => <li key={consumer}>• {consumer}</li>)}
                          </ul>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-[var(--color-text-muted)]">Business questions answered</p>
                          <ul className="mt-2 space-y-1.5 text-[var(--color-text-secondary)]">
                            {tableDetail.data.businessQuestions.map((question) => <li key={question}>• {question}</li>)}
                          </ul>
                        </div>
                      </div>
                    </details>

                    <details className="group rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface-1)]">
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4 text-sm font-medium text-[var(--color-text-primary)]">
                        View Transformation Story
                        <ChevronDown className="h-4 w-4 text-[var(--color-text-muted)] transition-transform group-open:rotate-180" strokeWidth={1.75} />
                      </summary>
                      <div className="space-y-4 border-t border-[var(--color-border)] p-4 text-sm">
                        <div>
                          <p className="text-xs font-medium text-[var(--color-text-muted)]">Raw state</p>
                          <p className="mt-1 leading-relaxed text-[var(--color-text-secondary)]">{tableDetail.data.transformationStory.rawState}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-[var(--color-text-muted)]">Transformation steps</p>
                          <ul className="mt-2 space-y-1.5 text-[var(--color-text-secondary)]">
                            {tableDetail.data.transformationStory.steps.map((step) => <li key={step} className="flex gap-2"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--color-success)]" strokeWidth={2} />{step}</li>)}
                          </ul>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-[var(--color-text-muted)]">Resulting state</p>
                          <p className="mt-1 leading-relaxed text-[var(--color-text-secondary)]">{tableDetail.data.transformationStory.resultingState}</p>
                        </div>
                      </div>
                    </details>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {layers.data && layers.data.layers.length === 0 && (
          <EmptyState
            title="No medallion layers available"
            description="Layers will appear once warehouse metadata is available."
          />
        )}
      </div>
    </div>
  )
}
