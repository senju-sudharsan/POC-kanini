import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Area, AreaChart, Cell, Pie, PieChart, Tooltip, XAxis, YAxis } from 'recharts'
import { TopBar } from '@/components/layout/TopBar'
import { ChartContainer, chartTooltipStyle } from '@/components/charts/ChartContainer'
import { ErrorState } from '@/components/feedback/ErrorState'
import { LoadingState } from '@/components/feedback/LoadingState'
import { StatusBadge } from '@/components/ui/status-badge'
import { ObservabilityCard, ObservabilityHero, Metric } from '@/features/observability/components'
import { useValidationResults } from '@/features/quality/hooks/useValidationResults'
import { useQuery } from '@tanstack/react-query'
import { getQualityHistory, getQualitySummary } from '@/services/qualityApi'
import { formatAbsoluteTime, formatNumber } from '@/lib/formatters'
import type { GXValidation } from '@/types/quality'

const DATASETS = ['customers', 'orders', 'products', 'payments', 'api_customers', 'api_orders', 'api_products']
const CHECKS = ['Null checks', 'Uniqueness', 'Volume checks', 'Referential integrity', 'Positive values']
const PIE_COLORS = ['#DC2626', '#7F1D1D']

function checkGroup(expectation: string) {
  const value = expectation.toLowerCase()
  if (value.includes('not_be_null')) return 'Null checks'
  if (value.includes('unique')) return 'Uniqueness'
  if (value.includes('row_count')) return 'Volume checks'
  if (value.includes('in_set')) return 'Referential integrity'
  return 'Positive values'
}

function displayDataset(value: string) { return value.replace(/_/g, ' ') }

export function DataQualityCenterPage() {
  const validations = useValidationResults()
  const summary = useQuery({ queryKey: ['quality', 'summary'], queryFn: getQualitySummary })
  const history = useQuery({ queryKey: ['quality', 'history'], queryFn: getQualityHistory })
  const [selected, setSelected] = useState<GXValidation | null>(null)
  const records = validations.data?.validations ?? []
  const failures = records.filter(record => record.status === 'failed')
  const timeline = useMemo(() => records.slice(0, 12).sort((a, b) => a.timestamp.localeCompare(b.timestamp)), [records])
  const distribution = [{ name: 'Passed', value: summary.data?.passed ?? records.filter(item => item.status === 'passed').length }, { name: 'Failed', value: summary.data?.failed ?? failures.length }]

  return <div className="flex min-h-screen min-w-0 flex-col"><TopBar title="Data Quality Center" description="Great Expectations health, failures, and execution observability" /><main className="flex-1 space-y-6 p-6 pb-6">
    <ObservabilityHero eyebrow="Data observability" title="Trust signals across every warehouse dataset." description="Validation coverage, health trends, and actionable expectation failures in one view." status={summary.data?.lastValidationRun ? `Last run ${formatAbsoluteTime(summary.data.lastValidationRun)}` : 'Waiting for validation run'} />
    <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4"><Metric label="Validation success" value={`${summary.data?.successRate ?? 0}%`} detail="Average expectation health" /><Metric label="Passed expectations" value={formatNumber(summary.data?.passed ?? 0)} detail="Across retained validation runs" /><Metric label="Failed expectations" value={formatNumber(summary.data?.failed ?? 0)} detail="Click a heatmap cell to investigate" /><Metric label="Total coverage" value={formatNumber(summary.data?.totalExpectations ?? 0)} detail="Persisted GX expectation results" /></section>
    {(validations.isLoading || history.isLoading) && <LoadingState variant="chart" />}
    {(validations.isError || history.isError) && <ErrorState onRetry={() => { validations.refetch(); history.refetch() }} />}
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.4fr_0.6fr]"><ObservabilityCard title="Validation health trend" description="Historical success rate from persisted Great Expectations runs.">{history.data && <ChartContainer isEmpty={!history.data.trend.length}><AreaChart data={history.data.trend}><defs><linearGradient id="qualityArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#EF4444" stopOpacity={0.48} /><stop offset="100%" stopColor="#7F1D1D" stopOpacity={0.03} /></linearGradient></defs><XAxis dataKey="timestamp" tickFormatter={value => new Date(value).toLocaleDateString()} tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} /><YAxis domain={[0, 100]} tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} /><Tooltip {...chartTooltipStyle} /><Area type="monotone" dataKey="successRate" name="Success rate %" stroke="#EF4444" strokeWidth={3} fill="url(#qualityArea)" /></AreaChart></ChartContainer>}</ObservabilityCard><ObservabilityCard title="Quality distribution" description="Expectation outcomes in the retained validation history."><ChartContainer isEmpty={distribution.every(item => item.value === 0)}><PieChart><Pie data={distribution} dataKey="value" nameKey="name" innerRadius={62} outerRadius={92} paddingAngle={3}>{distribution.map((item, index) => <Cell key={item.name} fill={PIE_COLORS[index]} />)}</Pie><Tooltip {...chartTooltipStyle} /></PieChart></ChartContainer><div className="mt-2 flex justify-center gap-5 text-xs text-[var(--color-text-secondary)]">{distribution.map((item, index) => <span key={item.name} className="flex items-center gap-2"><i className="h-2 w-2 rounded-full" style={{ background: PIE_COLORS[index] }} />{item.name}: {formatNumber(item.value)}</span>)}</div></ObservabilityCard></div>
    <ObservabilityCard title="Data quality validation network" description="Dataset → validation family → individual validation. Select a node for a dataset deep dive."><div className="space-y-4">{DATASETS.map(dataset => { const datasetRecords = records.filter(record => record.dataset.toLowerCase().replace(/\s/g, '_') === dataset); return <div key={dataset} className="flex flex-wrap items-center gap-2 rounded-lg border border-red-950/50 bg-[#180f10] p-3"><Link to={`/quality/${dataset.replace('api_', '')}`} className="rounded-md border border-red-800 bg-red-950/50 px-3 py-2 text-sm font-semibold capitalize text-red-100 hover:bg-red-900/60">{displayDataset(dataset)}</Link><span className="text-red-500">→</span>{CHECKS.map(check => { const family = datasetRecords.filter(record => checkGroup(record.expectation) === check); const failed = family.some(record => record.status === 'failed'); const status = failed ? 'border-red-500 bg-red-950/60 text-red-100' : family.length ? 'border-red-900 bg-[#341113] text-red-200' : 'border-[var(--color-border)] bg-[var(--color-surface-3)] text-[var(--color-text-muted)]'; return <button key={check} onClick={() => family[0] && setSelected(family.find(record => record.status === 'failed') ?? family[0])} className={`rounded-md border px-3 py-2 text-xs transition hover:scale-[1.02] ${status}`} title={family[0] ? `${family[0].successPercent}% · ${family[0].unexpectedCount} unexpected` : 'Not applicable'}>{check}{family.length ? ` · ${failed ? 'failed' : 'passed'}` : ' · N/A'}</button> })}</div> })}</div></ObservabilityCard>
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2"><ObservabilityCard title="Failure analysis" description="Select an expectation from the heatmap or review the latest failed checks."><div className="space-y-3">{(selected ? [selected] : failures.slice(0, 5)).map(record => <button key={record.validationId} onClick={() => setSelected(record)} className="flex w-full items-center justify-between rounded-lg border border-red-950/60 bg-[#210f11] px-4 py-3 text-left transition hover:bg-[#2b1113]"><div><p className="text-sm font-medium text-[var(--color-text-primary)]">{displayDataset(record.dataset)} · {record.expectation}</p><p className="mt-1 text-xs text-[var(--color-text-muted)]">{formatNumber(record.unexpectedCount)} unexpected · {formatAbsoluteTime(record.timestamp)}</p></div><StatusBadge status="failed" /></button>)}{!selected && !failures.length && <p className="text-sm text-[var(--color-text-muted)]">No failed expectations in the retained history.</p>}</div>{selected && <div className="mt-4 rounded-lg border border-red-900/70 bg-red-950/20 p-4"><p className="text-xs uppercase tracking-wider text-red-300">Selected failure</p><dl className="mt-3 grid grid-cols-2 gap-3 text-sm"><div><dt className="text-xs text-[var(--color-text-muted)]">Failure percentage</dt><dd>{(100 - selected.successPercent).toFixed(2)}%</dd></div><div><dt className="text-xs text-[var(--color-text-muted)]">Unexpected count</dt><dd>{formatNumber(selected.unexpectedCount)}</dd></div><div className="col-span-2"><dt className="text-xs text-[var(--color-text-muted)]">Timestamp</dt><dd>{formatAbsoluteTime(selected.timestamp)}</dd></div></dl></div>}</ObservabilityCard><ObservabilityCard title="Validation execution timeline" description="Chronological expectation outcomes; duration is not exposed by the existing API."><div className="space-y-3">{timeline.map(record => <div key={record.validationId} className="flex gap-3"><div className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${record.status === 'passed' ? 'bg-red-500' : 'bg-red-300 shadow-[0_0_10px_#ef4444]'}`} /><div className="min-w-0 flex-1 border-b border-red-950/40 pb-3"><div className="flex items-center justify-between gap-2"><p className="truncate text-sm text-[var(--color-text-primary)]">{displayDataset(record.dataset)} · {record.expectation}</p><StatusBadge status={record.status} /></div><p className="mt-1 text-xs text-[var(--color-text-muted)]">Run {formatAbsoluteTime(record.timestamp)} · Duration unavailable</p></div></div>)}</div></ObservabilityCard></div>
  </main></div>
}
