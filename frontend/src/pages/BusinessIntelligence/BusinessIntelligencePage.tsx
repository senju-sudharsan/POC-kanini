import { useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  Treemap,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { TreemapNode } from 'recharts'
import { Award, Building2, CheckCircle2, ShoppingBag, Store, Users } from 'lucide-react'
import { TopBar } from '@/components/layout/TopBar'
import { ChartContainer, chartTooltipStyle } from '@/components/charts/ChartContainer'
import { ErrorState } from '@/components/feedback/ErrorState'
import { LoadingState } from '@/components/feedback/LoadingState'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { usePaymentDistribution } from '@/features/analytics/hooks/usePaymentDistribution'
import { useRevenueTrend } from '@/features/analytics/hooks/useRevenueTrend'
import { useSellerPerformance } from '@/features/analytics/hooks/useSellerPerformance'
import { useTopCategories } from '@/features/analytics/hooks/useTopCategories'
import { useCustomerSCDHistory } from '@/features/scd/hooks/useCustomerSCDHistory'
import { useSCDSummary } from '@/features/scd/hooks/useSCDSummary'
import { formatAbsoluteTime, formatCompactNumber, formatCurrency, formatNumber, formatPercentage } from '@/lib/formatters'
import type { RevenueTrendGranularity } from '@/types/analytics'

const GRANULARITIES: RevenueTrendGranularity[] = ['day', 'week', 'month']
const PAYMENT_COLORS = ['#DC2626', '#7F1D1D', '#6B7280', '#111827']
const TREEMAP_COLORS = ['#FECACA', '#F87171', '#EF4444', '#DC2626']
const DEFAULT_SCD_CUSTOMER_ID = '00012a2ce6f8dcda20d059ce98491703'

function SectionError({ message, retry }: { message?: string; retry: () => void }) {
  return <ErrorState message={message} onRetry={retry} />
}

function RevenueTreemapTile({ x, y, width, height, name, value, root }: TreemapNode) {
  const highestRevenue = Math.max(...(root?.children?.map((node) => node.value) ?? [value]), 1)
  const intensity = value / highestRevenue
  const color = TREEMAP_COLORS[Math.min(TREEMAP_COLORS.length - 1, Math.floor(intensity * TREEMAP_COLORS.length))]
  const showRevenue = width > 105 && height > 58

  return (
    <g>
      <rect x={x} y={y} width={width} height={height} fill={color} stroke="var(--color-surface-0)" strokeWidth={3} rx={3} />
      {width > 50 && height > 32 && <text x={x + 10} y={y + 20} fill="#450A0A" fontSize={13} fontWeight={700}>{name}</text>}
      {showRevenue && <text x={x + 10} y={y + 39} fill="#450A0A" fontSize={11}>{formatCurrency(value)}</text>}
    </g>
  )
}

export function BusinessIntelligencePage() {
  const [granularity, setGranularity] = useState<RevenueTrendGranularity>('month')
  const revenueTrend = useRevenueTrend(granularity)
  const topCategories = useTopCategories(10)
  const sellerPerformance = useSellerPerformance(10)
  const paymentDistribution = usePaymentDistribution()
  const scdSummary = useSCDSummary()
  const customerHistory = useCustomerSCDHistory(DEFAULT_SCD_CUSTOMER_ID)
  const overview = revenueTrend.data
  const treemapData: Array<{ [key: string]: unknown }> = overview?.geography.map((item) => ({ ...item })) ?? []
  const paymentMethods = paymentDistribution.data?.methods.map((method) => ({
    ...method,
    type: method.type === 'NOT_DEFINED' ? 'Unknown' : method.type,
  })) ?? []
  const changedVersions = customerHistory.data?.versions.slice(0, 2) ?? []

  return (
    <div className="flex min-h-screen min-w-0 flex-col">
      <TopBar title="Business Intelligence" description="Executive view of warehouse performance and data maturity" />
      <main className="flex-1 space-y-6 p-6 pb-6">
        <section className="rounded-[var(--radius-card)] border border-red-950/70 bg-gradient-to-r from-[#2a0b0b] via-[var(--color-surface-2)] to-[var(--color-surface-2)] p-6">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-red-400">Executive analytics</p>
          <div className="mt-2 flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-[var(--color-text-primary)]">Performance, trusted by the warehouse.</h2>
              <p className="mt-1 text-sm text-[var(--color-text-secondary)]">Gold-layer revenue intelligence with customer, seller, payment, and geographic context.</p>
            </div>
            <span className="inline-flex items-center gap-2 text-xs font-medium text-red-300"><span className="h-2 w-2 rounded-full bg-red-500" />Live warehouse metrics</span>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Executive KPIs">
          {revenueTrend.isLoading && Array.from({ length: 4 }).map((_, index) => <Card key={index}><LoadingState variant="stat" /></Card>)}
          {revenueTrend.isError && <div className="col-span-full"><SectionError message={revenueTrend.error instanceof Error ? revenueTrend.error.message : undefined} retry={() => revenueTrend.refetch()} /></div>}
          {overview && [
            { label: 'Total Revenue', value: formatCurrency(overview.kpis.totalRevenue), detail: 'All Gold sales periods', icon: Award },
            { label: 'Total Orders', value: formatCompactNumber(overview.kpis.totalOrders), detail: 'Orders recorded in sales summary', icon: ShoppingBag },
            { label: 'Total Customers', value: formatCompactNumber(overview.kpis.totalCustomers), detail: 'Unique customer identities', icon: Users },
            { label: 'Total Sellers', value: formatCompactNumber(overview.kpis.totalSellers), detail: 'Active Gold performance records', icon: Store },
          ].map(({ label, value, detail, icon: Icon }) => (
            <Card key={label} className="border-red-950/60 bg-gradient-to-br from-[var(--color-surface-2)] to-[#1c1011]">
              <div className="flex items-center justify-between"><span className="text-sm font-medium text-[var(--color-text-secondary)]">{label}</span><Icon className="h-4 w-4 text-red-400" /></div>
              <p className="mt-5 tabular-nums text-3xl font-semibold tracking-tight text-[var(--color-text-primary)]">{value}</p>
              <p className="mt-2 text-xs text-[var(--color-text-muted)]">{detail}</p>
            </Card>
          ))}
        </section>

        <Card className="border-red-950/60">
          <CardHeader><div><CardTitle className="text-[var(--color-text-primary)]">Revenue Trend</CardTitle><p className="mt-1 text-xs text-[var(--color-text-muted)]">Revenue growth by reporting period from Gold sales_summary.</p></div><div className="flex gap-1">{GRANULARITIES.map((option) => <Button key={option} size="sm" variant={granularity === option ? 'primary' : 'ghost'} onClick={() => setGranularity(option)}>{option}</Button>)}</div></CardHeader>
          <CardContent>
            {revenueTrend.isLoading && <LoadingState variant="chart" />}
            {revenueTrend.isError && <SectionError message={revenueTrend.error instanceof Error ? revenueTrend.error.message : undefined} retry={() => revenueTrend.refetch()} />}
            {overview && <ChartContainer isEmpty={overview.points.length === 0} emptyTitle="No revenue trend available"><LineChart data={overview.points} margin={{ top: 16, right: 16, bottom: 0, left: 8 }}><defs><linearGradient id="revenueLine" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#DC2626" /><stop offset="100%" stopColor="#F97316" /></linearGradient></defs><CartesianGrid vertical={false} stroke="var(--color-border)" /><XAxis dataKey="period" tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} minTickGap={28} /><YAxis tickFormatter={(value: number) => formatCurrency(value)} tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} width={76} /><Tooltip {...chartTooltipStyle} formatter={(value) => formatCurrency(Number(value), true)} /><Line type="monotone" dataKey="revenue" name="Revenue" stroke="url(#revenueLine)" strokeWidth={3} dot={false} activeDot={{ r: 5, fill: '#EF4444' }} /></LineChart></ChartContainer>}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <Card className="border-red-950/60"><CardHeader><div><CardTitle className="text-[var(--color-text-primary)]">Top Product Categories</CardTitle><p className="mt-1 text-xs text-[var(--color-text-muted)]">Highest-revenue categories with units sold from Gold product_performance.</p></div></CardHeader><CardContent>
            {topCategories.isLoading && <LoadingState variant="chart" />}
            {topCategories.isError && <SectionError message={topCategories.error instanceof Error ? topCategories.error.message : undefined} retry={() => topCategories.refetch()} />}
            {topCategories.data && <ChartContainer isEmpty={topCategories.data.categories.length === 0} emptyTitle="No category data available"><BarChart data={topCategories.data.categories} layout="vertical" margin={{ top: 4, right: 12, bottom: 0, left: 8 }}><CartesianGrid horizontal={false} stroke="var(--color-border)" /><XAxis type="number" tickFormatter={(value: number) => formatCurrency(value)} tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} /><YAxis type="category" dataKey="category" width={128} tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} /><Tooltip {...chartTooltipStyle} formatter={(value, name) => String(name) === 'Revenue' ? formatCurrency(Number(value), true) : formatNumber(Number(value))} /><Bar dataKey="revenue" name="Revenue" fill="#991B1B" radius={[0, 4, 4, 0]} /></BarChart></ChartContainer>}
            {topCategories.data && <p className="mt-3 text-xs text-[var(--color-text-muted)]">Top category volume: {formatNumber(topCategories.data.categories[0]?.unitsSold ?? 0)} units sold.</p>}
          </CardContent></Card>

          <Card className="border-red-950/60"><CardHeader><div><CardTitle className="text-[var(--color-text-primary)]">Payment Distribution</CardTitle><p className="mt-1 text-xs text-[var(--color-text-muted)]">Customer payment behavior from Silver payments.</p></div></CardHeader><CardContent>
            {paymentDistribution.isLoading && <LoadingState variant="chart" />}
            {paymentDistribution.isError && <SectionError message={paymentDistribution.error instanceof Error ? paymentDistribution.error.message : undefined} retry={() => paymentDistribution.refetch()} />}
            {paymentDistribution.data && <><ChartContainer isEmpty={paymentMethods.length === 0} emptyTitle="No payment data available"><PieChart><Pie data={paymentMethods} dataKey="count" nameKey="type" innerRadius={64} outerRadius={96} paddingAngle={2}>{paymentMethods.map((method, index) => <Cell key={method.type} fill={PAYMENT_COLORS[index % PAYMENT_COLORS.length]} />)}</Pie><Tooltip {...chartTooltipStyle} formatter={(value) => formatNumber(Number(value))} /></PieChart></ChartContainer><div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">{paymentMethods.map((method, index) => <div key={method.type} className="flex items-center justify-between text-[var(--color-text-secondary)]"><span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: PAYMENT_COLORS[index % PAYMENT_COLORS.length] }} />{method.type}</span><span>{formatPercentage(method.percentage)}</span></div>)}</div></>}
          </CardContent></Card>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <Card className="border-red-950/60"><CardHeader><div><CardTitle className="text-[var(--color-text-primary)]">Seller Leaderboard</CardTitle><p className="mt-1 text-xs text-[var(--color-text-muted)]">Top 10 revenue leaders from Gold seller_performance.</p></div></CardHeader><CardContent>
            {sellerPerformance.isLoading && <LoadingState variant="table-row" count={8} />}
            {sellerPerformance.isError && <SectionError message={sellerPerformance.error instanceof Error ? sellerPerformance.error.message : undefined} retry={() => sellerPerformance.refetch()} />}
            {sellerPerformance.data && <div className="space-y-2">{sellerPerformance.data.sellers.map((seller, index) => <div key={seller.sellerId} className="flex items-center gap-3 rounded-lg border border-red-950/40 bg-[#180f10] px-3 py-2.5"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-950 text-xs font-semibold text-red-200">{index + 1}</span><span className="min-w-0 flex-1 truncate font-mono text-xs text-[var(--color-text-primary)]">{seller.sellerId}</span><div className="text-right"><p className="tabular-nums text-sm font-medium text-[var(--color-text-primary)]">{formatCurrency(seller.revenue, true)}</p><p className="text-xs text-[var(--color-text-muted)]">{formatNumber(seller.ordersFulfilled)} fulfilled</p></div></div>)}</div>}
          </CardContent></Card>

          <Card className="border-red-950/60"><CardHeader><div><CardTitle className="text-[var(--color-text-primary)]">Customer Funnel</CardTitle><p className="mt-1 text-xs text-[var(--color-text-muted)]">Warehouse row counts showing the customer-to-payment journey.</p></div></CardHeader><CardContent>
            {revenueTrend.isLoading && <LoadingState variant="chart" />}
            {overview && <div className="space-y-3 pt-1">{overview.funnel.map((stage, index) => { const percent = Math.max(38, 100 - index * 18); return <div key={stage.stage} className="mx-auto" style={{ width: `${percent}%` }}><div className="flex items-center justify-between bg-gradient-to-r from-[#7F1D1D] to-[#EF4444] px-4 py-3 text-sm text-white"><span>{stage.stage}</span><span className="font-semibold tabular-nums">{formatCompactNumber(stage.count)}</span></div>{index < overview.funnel.length - 1 && <div className="mx-auto h-3 w-px bg-red-800" />}</div> })}</div>}
          </CardContent></Card>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.35fr_0.65fr]">
          <Card className="border-red-950/60"><CardHeader><div><CardTitle className="text-[var(--color-text-primary)]">Geographic Revenue Distribution</CardTitle><p className="mt-1 text-xs text-[var(--color-text-muted)]">Revenue concentration by state, joined to Bronze geolocation reference data.</p></div></CardHeader><CardContent>
            {revenueTrend.isLoading && <LoadingState variant="chart" />}
            {overview && <ChartContainer isEmpty={treemapData.length === 0} emptyTitle="No geographic revenue available"><Treemap data={treemapData} dataKey="revenue" nameKey="state" aspectRatio={4 / 3} nodeGap={3} content={RevenueTreemapTile} colorPanel={TREEMAP_COLORS}><Tooltip {...chartTooltipStyle} formatter={(value) => formatCurrency(Number(value), true)} /></Treemap></ChartContainer>}
          </CardContent></Card>

          <Card className="border-red-950/60 bg-gradient-to-b from-[#210f11] to-[var(--color-surface-2)]"><CardHeader><div><CardTitle className="text-[var(--color-text-primary)]">Pipeline &amp; Data Quality</CardTitle><p className="mt-1 text-xs text-[var(--color-text-muted)]">Warehouse metadata posture.</p></div><Building2 className="h-5 w-5 text-red-400" /></CardHeader><CardContent>
            {revenueTrend.isLoading && <LoadingState variant="stat" />}
            {overview && <div className="space-y-5"><div><p className="text-xs uppercase tracking-wider text-[var(--color-text-muted)]">Quality score</p><p className="mt-1 text-4xl font-semibold tabular-nums text-[var(--color-text-primary)]">{overview.dataQuality.score}<span className="text-lg text-red-300">/100</span></p></div><div className="flex items-center gap-2 text-sm"><CheckCircle2 className="h-4 w-4 text-red-400" /><span className="text-[var(--color-text-secondary)]">Validation</span><span className="ml-auto capitalize text-red-200">{overview.dataQuality.validationStatus}</span></div><div className="grid grid-cols-3 gap-2 border-t border-red-950/60 pt-4">{(['bronze', 'silver', 'gold'] as const).map((layer) => <div key={layer}><p className="text-xs capitalize text-[var(--color-text-muted)]">{layer}</p><p className="mt-1 text-xl font-semibold tabular-nums text-[var(--color-text-primary)]">{overview.dataQuality.tableCounts[layer]}</p><p className="text-xs text-[var(--color-text-muted)]">tables</p></div>)}</div></div>}
          </CardContent></Card>
        </div>

        <section className="space-y-4" aria-labelledby="scd-title">
          <div>
            <h2 id="scd-title" className="text-base font-semibold text-[var(--color-text-primary)]">Slowly Changing Dimensions</h2>
            <p className="mt-1 text-xs text-[var(--color-text-muted)]">Customer attribute governance and version history from Silver customers_scd.</p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <Card className="min-h-30 border-[#7C3AED] p-4"><CardTitle className="text-[var(--color-text-primary)]">SCD Type 1</CardTitle><p className="mt-2 text-xs leading-relaxed text-[var(--color-text-secondary)]">Overwrites the current customer city and state without creating a history version.</p></Card>
            <Card className="min-h-30 border-[#7C3AED] p-4"><CardTitle className="text-[var(--color-text-primary)]">SCD Type 2</CardTitle><p className="mt-2 text-xs leading-relaxed text-[var(--color-text-secondary)]">Expires changed attributes and creates the next customer version.</p></Card>
            <Card className="min-h-30 border-[#8B5CF6] p-4"><CardTitle className="text-[var(--color-text-primary)]">Active Records</CardTitle>{scdSummary.isLoading ? <LoadingState variant="stat" className="mt-3" /> : <p className="mt-3 text-2xl font-semibold tabular-nums text-[#A855F7]">{formatCompactNumber(scdSummary.data?.activeRecords)}</p>}</Card>
            <Card className="min-h-30 border-[#8B5CF6] p-4"><CardTitle className="text-[var(--color-text-primary)]">Historical Records</CardTitle>{scdSummary.isLoading ? <LoadingState variant="stat" className="mt-3" /> : <p className="mt-3 text-2xl font-semibold tabular-nums text-[#A855F7]">{formatCompactNumber(scdSummary.data?.historicalRecords)}</p>}</Card>
            <Card className="min-h-30 border-[#8B5CF6] p-4"><CardTitle className="text-[var(--color-text-primary)]">Multi-Version Customers</CardTitle>{scdSummary.isLoading ? <LoadingState variant="stat" className="mt-3" /> : <p className="mt-3 text-2xl font-semibold tabular-nums text-[#A855F7]">{formatCompactNumber(scdSummary.data?.customersWithMultipleVersions)}</p>}</Card>
          </div>
          {scdSummary.isError && <SectionError message={scdSummary.error instanceof Error ? scdSummary.error.message : undefined} retry={() => scdSummary.refetch()} />}
          <Card className="border-[#7C3AED]">
            <CardHeader><div><CardTitle className="text-[var(--color-text-primary)]">SCD Version Timeline</CardTitle><p className="mt-1 text-xs text-[var(--color-text-muted)]">The two records created by the customer location change.</p></div></CardHeader>
            <CardContent>
              {customerHistory.isLoading && <LoadingState variant="table-row" count={2} />}
              {customerHistory.data && <div className="flex flex-col gap-3 xl:flex-row xl:items-stretch">{changedVersions.map((version, index) => <div key={version.versionNumber} className="flex flex-1 flex-col xl:flex-row xl:items-stretch"><div className={version.isCurrent ? 'flex-1 rounded-[var(--radius-control)] border border-[#A855F7] bg-[#7C3AED]/10 p-4' : 'flex-1 rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface-1)] p-4 opacity-75'}><div className="flex items-center justify-between gap-3"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#7C3AED] text-xs font-semibold text-white">{version.versionNumber}</span><span className={version.isCurrent ? 'rounded-full bg-[#A855F7] px-2.5 py-1 text-xs font-medium text-white' : 'rounded-full bg-[var(--color-surface-3)] px-2.5 py-1 text-xs font-medium text-[var(--color-text-secondary)]'}>{version.isCurrent ? 'Current' : 'Historical'}</span></div><p className="mt-4 text-sm font-semibold text-[var(--color-text-primary)]">{version.customerCity ?? 'Unknown city'}</p><p className="mt-1 text-xs text-[var(--color-text-secondary)]">{version.customerState ?? 'Unknown state'}</p><dl className="mt-4 space-y-2 text-xs"><div className="flex justify-between gap-3"><dt className="text-[var(--color-text-muted)]">Effective start</dt><dd className="text-right text-[var(--color-text-secondary)]">{formatAbsoluteTime(version.effectiveStartDate)}</dd></div><div className="flex justify-between gap-3"><dt className="text-[var(--color-text-muted)]">Effective end</dt><dd className="text-right text-[var(--color-text-secondary)]">{formatAbsoluteTime(version.effectiveEndDate)}</dd></div><div className="flex justify-between gap-3"><dt className="text-[var(--color-text-muted)]">Current flag</dt><dd className="text-[#A855F7]">{version.isCurrent ? 'True' : 'False'}</dd></div></dl></div>{index < changedVersions.length - 1 && <div className="flex h-8 items-center justify-center xl:h-auto xl:w-12"><span className="h-px w-6 bg-[#8B5CF6] xl:w-8" /><span className="ml-1 text-[#A855F7]">→</span><span className="sr-only">Change detected</span></div>}</div>)}</div>}
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  )
}
