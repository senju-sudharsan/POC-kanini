import { useState } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, Tooltip, XAxis, YAxis } from 'recharts'
import { TopBar } from '@/components/layout/TopBar'
import { ChartContainer, chartColors, chartTooltipStyle } from '@/components/charts/ChartContainer'
import { ErrorState } from '@/components/feedback/ErrorState'
import { LoadingState } from '@/components/feedback/LoadingState'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { usePaymentDistribution } from '@/features/analytics/hooks/usePaymentDistribution'
import { useRevenueTrend } from '@/features/analytics/hooks/useRevenueTrend'
import { useSellerPerformance } from '@/features/analytics/hooks/useSellerPerformance'
import { useTopCategories } from '@/features/analytics/hooks/useTopCategories'
import { formatCurrency, formatNumber, formatPercentage } from '@/lib/formatters'
import type { RevenueTrendGranularity } from '@/types/analytics'

const GRANULARITIES: RevenueTrendGranularity[] = ['day', 'week', 'month']

export function BusinessIntelligencePage() {
  const [granularity, setGranularity] = useState<RevenueTrendGranularity>('month')
  const revenueTrend = useRevenueTrend(granularity)
  const topCategories = useTopCategories()
  const sellerPerformance = useSellerPerformance()
  const paymentDistribution = usePaymentDistribution()
  return (
    <div className="flex flex-1 flex-col">
      <TopBar title="Business Intelligence" description="Revenue, categories, sellers, and payments" />
      <div className="flex-1 space-y-6 p-6">
        <Card><CardHeader><div><CardTitle>Revenue trend</CardTitle><p className="mt-1 text-xs text-[var(--color-text-muted)]">Gold-layer revenue by reporting period.</p></div><div className="flex gap-1">{GRANULARITIES.map((option) => <Button key={option} size="sm" variant={granularity === option ? 'primary' : 'ghost'} onClick={() => setGranularity(option)}>{option}</Button>)}</div></CardHeader><CardContent>
          {revenueTrend.isLoading && <LoadingState variant="chart" />}
          {revenueTrend.isError && <ErrorState message={revenueTrend.error instanceof Error ? revenueTrend.error.message : undefined} onRetry={() => revenueTrend.refetch()} />}
          {revenueTrend.data && <ChartContainer isEmpty={revenueTrend.data.points.length === 0} emptyTitle="No revenue trend available"><LineChart data={revenueTrend.data.points} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}><CartesianGrid vertical={false} stroke="var(--color-border)" /><XAxis dataKey="period" tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} /><YAxis tickFormatter={(value: number) => formatCurrency(value)} tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} width={76} /><Tooltip {...chartTooltipStyle} formatter={(value) => formatCurrency(Number(value), true)} /><Line type="monotone" dataKey="revenue" name="Revenue" stroke={chartColors[0]} strokeWidth={2} dot={false} /></LineChart></ChartContainer>}
        </CardContent></Card>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <Card><CardHeader><div><CardTitle>Top categories</CardTitle><p className="mt-1 text-xs text-[var(--color-text-muted)]">Highest revenue categories returned by the warehouse.</p></div></CardHeader><CardContent>
            {topCategories.isLoading && <LoadingState variant="chart" />}
            {topCategories.isError && <ErrorState message={topCategories.error instanceof Error ? topCategories.error.message : undefined} onRetry={() => topCategories.refetch()} />}
            {topCategories.data && <ChartContainer isEmpty={topCategories.data.categories.length === 0} emptyTitle="No category data available"><BarChart data={topCategories.data.categories} layout="vertical" margin={{ top: 4, right: 8, bottom: 0, left: 8 }}><CartesianGrid horizontal={false} stroke="var(--color-border)" /><XAxis type="number" tickFormatter={(value: number) => formatCurrency(value)} tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} /><YAxis type="category" dataKey="category" width={120} tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} /><Tooltip {...chartTooltipStyle} formatter={(value, name) => String(name) === 'revenue' ? formatCurrency(Number(value), true) : formatNumber(Number(value))} /><Bar dataKey="revenue" name="revenue" fill={chartColors[1]} radius={[0, 4, 4, 0]} /></BarChart></ChartContainer>}
          </CardContent></Card>
          <Card><CardHeader><div><CardTitle>Payment distribution</CardTitle><p className="mt-1 text-xs text-[var(--color-text-muted)]">Payment-method mix from completed orders.</p></div></CardHeader><CardContent>
            {paymentDistribution.isLoading && <LoadingState variant="chart" />}
            {paymentDistribution.isError && <ErrorState message={paymentDistribution.error instanceof Error ? paymentDistribution.error.message : undefined} onRetry={() => paymentDistribution.refetch()} />}
            {paymentDistribution.data && <><ChartContainer isEmpty={paymentDistribution.data.methods.length === 0} emptyTitle="No payment data available"><PieChart><Pie data={paymentDistribution.data.methods} dataKey="count" nameKey="type" innerRadius={62} outerRadius={96} paddingAngle={2}>{paymentDistribution.data.methods.map((method, index) => <Cell key={method.type} fill={chartColors[index % chartColors.length]} />)}</Pie><Tooltip {...chartTooltipStyle} formatter={(value) => formatNumber(Number(value))} /><Legend wrapperStyle={{ fontSize: '12px', color: 'var(--color-text-secondary)' }} /></PieChart></ChartContainer><div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--color-text-muted)]">{paymentDistribution.data.methods.map((method) => <span key={method.type}>{method.type}: {formatPercentage(method.percentage)}</span>)}</div></>}
          </CardContent></Card>
        </div>

        <Card><CardHeader><div><CardTitle>Seller performance</CardTitle><p className="mt-1 text-xs text-[var(--color-text-muted)]">Revenue-sorted seller performance from the Gold layer.</p></div></CardHeader><CardContent>
          {sellerPerformance.isLoading && <LoadingState variant="table-row" count={8} />}
          {sellerPerformance.isError && <ErrorState message={sellerPerformance.error instanceof Error ? sellerPerformance.error.message : undefined} onRetry={() => sellerPerformance.refetch()} />}
          {sellerPerformance.data && <div className="overflow-x-auto"><table className="w-full min-w-[700px] text-left text-sm"><thead className="border-b border-[var(--color-border)] text-xs text-[var(--color-text-muted)]"><tr><th className="pb-3 font-medium">Seller</th><th className="pb-3 text-right font-medium">Orders fulfilled</th><th className="pb-3 text-right font-medium">Revenue</th><th className="pb-3 text-right font-medium">Average review</th></tr></thead><tbody className="divide-y divide-[var(--color-border)]">{sellerPerformance.data.sellers.map((seller) => <tr key={seller.sellerId}><td className="py-3 font-mono text-xs text-[var(--color-text-primary)]">{seller.sellerId}</td><td className="py-3 text-right tabular-nums text-[var(--color-text-secondary)]">{formatNumber(seller.ordersFulfilled)}</td><td className="py-3 text-right tabular-nums text-[var(--color-text-secondary)]">{formatCurrency(seller.revenue, true)}</td><td className="py-3 text-right tabular-nums text-[var(--color-text-secondary)]">{seller.avgReviewScore.toFixed(2)}</td></tr>)}</tbody></table></div>}
        </CardContent></Card>
      </div>
    </div>
  )
}
