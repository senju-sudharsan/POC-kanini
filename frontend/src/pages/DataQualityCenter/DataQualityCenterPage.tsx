import { TopBar } from '@/components/layout/TopBar'
import { ErrorState } from '@/components/feedback/ErrorState'
import { LoadingState } from '@/components/feedback/LoadingState'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/ui/status-badge'
import { useIntegrityChecks } from '@/features/quality/hooks/useIntegrityChecks'
import { useQualityScore } from '@/features/quality/hooks/useQualityScore'
import { useRowCounts } from '@/features/quality/hooks/useRowCounts'
import { useValidationResults } from '@/features/quality/hooks/useValidationResults'
import { formatAbsoluteTime, formatNumber } from '@/lib/formatters'

export function DataQualityCenterPage() {
  const qualityScore = useQualityScore()
  const validationResults = useValidationResults()
  const rowCounts = useRowCounts()
  const integrityChecks = useIntegrityChecks()

  return (
    <div className="flex flex-1 flex-col">
      <TopBar title="Data Quality Center" description="Validation results and row-count audits" />
      <div className="flex-1 space-y-6 p-6">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Quality score</CardTitle>
              <p className="mt-1 text-xs text-[var(--color-text-muted)]">Latest warehouse quality assessment.</p>
            </div>
          </CardHeader>
          <CardContent>
            {qualityScore.isLoading && <LoadingState variant="stat" />}
            {qualityScore.isError && <ErrorState message={qualityScore.error instanceof Error ? qualityScore.error.message : undefined} onRetry={() => qualityScore.refetch()} />}
            {qualityScore.data && (
              <div className="flex items-end justify-between gap-4">
                <p className="tabular-nums text-4xl font-semibold tracking-tight text-[var(--color-text-primary)]">
                  {formatNumber(qualityScore.data.score)}
                  <span className="text-lg text-[var(--color-text-muted)]"> / {formatNumber(qualityScore.data.scale)}</span>
                </p>
                <p className="text-xs text-[var(--color-text-muted)]">Computed {formatAbsoluteTime(qualityScore.data.computedAt)}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <Card>
            <CardHeader><div><CardTitle>Validation results</CardTitle><p className="mt-1 text-xs text-[var(--color-text-muted)]">Checks reported by the validation workflow.</p></div></CardHeader>
            <CardContent>
              {validationResults.isLoading && <LoadingState variant="table-row" count={5} />}
              {validationResults.isError && <ErrorState message={validationResults.error instanceof Error ? validationResults.error.message : undefined} onRetry={() => validationResults.refetch()} />}
              {validationResults.data && <div className="divide-y divide-[var(--color-border)]">{validationResults.data.results.map((result) => <div key={result.check} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"><span className="text-sm text-[var(--color-text-primary)]">{result.check}</span><StatusBadge status={result.status} /></div>)}</div>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><div><CardTitle>Integrity checks</CardTitle><p className="mt-1 text-xs text-[var(--color-text-muted)]">Referential and domain integrity outcomes.</p></div></CardHeader>
            <CardContent>
              {integrityChecks.isLoading && <LoadingState variant="table-row" count={5} />}
              {integrityChecks.isError && <ErrorState message={integrityChecks.error instanceof Error ? integrityChecks.error.message : undefined} onRetry={() => integrityChecks.refetch()} />}
              {integrityChecks.data && <div className="divide-y divide-[var(--color-border)]">{integrityChecks.data.checks.map((check) => <div key={check.name} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"><div><p className="text-sm text-[var(--color-text-primary)]">{check.name}</p><p className="mt-0.5 text-xs text-[var(--color-text-muted)]">{formatNumber(check.violations)} violations</p></div><StatusBadge status={check.status} /></div>)}</div>}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><div><CardTitle>Bronze to Silver row-count audit</CardTitle><p className="mt-1 text-xs text-[var(--color-text-muted)]">Backend-reported record counts and deltas for each entity.</p></div></CardHeader>
          <CardContent>
            {rowCounts.isLoading && <LoadingState variant="table-row" count={6} />}
            {rowCounts.isError && <ErrorState message={rowCounts.error instanceof Error ? rowCounts.error.message : undefined} onRetry={() => rowCounts.refetch()} />}
            {rowCounts.data && <div className="overflow-x-auto"><table className="w-full min-w-[560px] text-left text-sm"><thead className="border-b border-[var(--color-border)] text-xs text-[var(--color-text-muted)]"><tr><th className="pb-3 font-medium">Entity</th><th className="pb-3 text-right font-medium">Bronze</th><th className="pb-3 text-right font-medium">Silver</th><th className="pb-3 text-right font-medium">Delta</th></tr></thead><tbody className="divide-y divide-[var(--color-border)]">{rowCounts.data.audits.map((audit) => <tr key={audit.entity}><td className="py-3 font-medium text-[var(--color-text-primary)]">{audit.entity}</td><td className="py-3 text-right tabular-nums text-[var(--color-text-secondary)]">{formatNumber(audit.bronzeCount)}</td><td className="py-3 text-right tabular-nums text-[var(--color-text-secondary)]">{formatNumber(audit.silverCount)}</td><td className="py-3 text-right tabular-nums text-[var(--color-text-secondary)]">{formatNumber(audit.delta)}</td></tr>)}</tbody></table></div>}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
