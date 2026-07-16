import { Link, useParams } from 'react-router-dom'
import { TopBar } from '@/components/layout/TopBar'
import { LoadingState } from '@/components/feedback/LoadingState'
import { ObservabilityCard, ObservabilityHero } from '@/features/observability/components'
import { useRevenueTrend } from '@/features/analytics/hooks/useRevenueTrend'
import { useTopCategories } from '@/features/analytics/hooks/useTopCategories'
import { useSellerPerformance } from '@/features/analytics/hooks/useSellerPerformance'
import { usePaymentDistribution } from '@/features/analytics/hooks/usePaymentDistribution'
import { formatCompactNumber, formatCurrency, formatNumber } from '@/lib/formatters'
import { ChangeBars, Density, HorizontalBars, Matrix, ParetoChart, ScatterPlot, TrendChart, Waterfall } from './ResponsiveVisuals'

type View = 'revenue' | 'categories' | 'sellers' | 'payments' | 'funnel' | 'geography'
const COPY: Record<View, [string, string, string]> = {
  revenue: ['Revenue Intelligence', 'Explain change through drivers, bridges, and concentration.', 'Why revenue changed'],
  categories: ['Category Intelligence', 'Identify dominant, emerging, and underperforming categories.', 'Which categories matter'],
  sellers: ['Seller Intelligence', 'Find the sellers and tiers creating durable value.', 'Who creates value'],
  payments: ['Payment Intelligence', 'Understand customer payment behavior and method mix.', 'How customers pay'],
  funnel: ['Customer Journey Intelligence', 'Locate conversion leakage throughout the customer journey.', 'Where customers are lost'],
  geography: ['Regional Intelligence', 'Compare state performance and regional opportunity.', 'Where regions perform'],
}
const WARM = ['#7F1D1D', '#DC2626', '#C2410C', '#D97706', '#FB7185']

export function AnalyticsDeepDivePage() {
  const { view: raw = 'revenue' } = useParams(); const view = (raw in COPY ? raw : 'revenue') as View
  // Monthly points keep the trend and change charts decision-readable instead of
  // compressing hundreds of daily marks into a single viewport.
  const revenue = useRevenueTrend('month'); const categories = useTopCategories(100); const sellers = useSellerPerformance(100); const payments = usePaymentDistribution()
  const loading = revenue.isLoading || categories.isLoading || sellers.isLoading || payments.isLoading
  const props = { revenue: revenue.data?.points ?? [], geography: revenue.data?.geography ?? [], funnel: revenue.data?.funnel ?? [], categories: categories.data?.categories ?? [], sellers: sellers.data?.sellers ?? [], payments: payments.data?.methods ?? [] }
  return <div className="flex min-h-screen min-w-0 flex-col"><TopBar title={COPY[view][0]} description={COPY[view][2]} /><main className="flex-1 space-y-6 p-6 pb-6"><div className="text-xs text-[var(--color-text-muted)]"><Link to="/analytics" className="text-red-300 hover:text-red-100">Business Intelligence</Link> → {COPY[view][0]}</div><ObservabilityHero eyebrow="Specialized analytics" title={COPY[view][0]} description={COPY[view][1]} status={COPY[view][2]} />{loading ? <LoadingState variant="chart" /> : <Workspace view={view} {...props} />}</main></div>
}

function Workspace({ view, ...data }: { view: View; revenue: { period: string; revenue: number }[]; geography: { state: string; revenue: number; orders: number }[]; funnel: { stage: string; count: number }[]; categories: { category: string; revenue: number; unitsSold: number }[]; sellers: { sellerId: string; revenue: number; ordersFulfilled: number }[]; payments: { type: string; count: number; percentage: number }[] }) {
  if (view === 'geography') return <Geography data={data.geography} />
  if (view === 'revenue') return <Revenue data={data.revenue} categories={data.categories} />
  if (view === 'sellers') return <Sellers data={data.sellers} />
  if (view === 'categories') return <Categories data={data.categories} />
  if (view === 'payments') return <Payments data={data.payments} />
  return <Funnel data={data.funnel} />
}

function Geography({ data }: { data: { state: string; revenue: number; orders: number }[] }) {
  return <div className="grid grid-cols-1 gap-6 xl:grid-cols-2"><Panel title="Brazil performance map" text="State node scale represents revenue; color distinguishes the regional comparison."><svg viewBox="0 0 360 300" className="mx-auto h-72 w-full max-w-md"><path d="M115 28 L235 48 300 105 265 230 180 278 85 220 50 125Z" fill="#2a1215" stroke="#9f2b2f" strokeWidth="3" />{data.map((d,i)=><g key={d.state}><circle cx={95+(i%4)*55} cy={80+Math.floor(i/4)*55} r={10+Math.min(18,d.revenue/100000)} fill={WARM[i%WARM.length]} opacity=".9"/><text x={95+(i%4)*55} y={84+Math.floor(i/4)*55} textAnchor="middle" fill="white" fontSize="9">{d.state}</text></g>)}</svg></Panel><Panel title="Regional revenue ranking" text="Compare the states creating the most commercial value."><HorizontalBars data={data.map(d=>({label:d.state,value:d.revenue}))} formatValue={v=>formatCurrency(v,true)} /></Panel><Panel title="Regional opportunity map" text="States with high order volume but comparatively lower revenue surface as opportunity."><ScatterPlot points={data.map(d=>({label:d.state,x:d.orders,y:d.revenue}))} /></Panel><Panel title="Regional performance matrix" text="Decision-ready state comparison with no hidden columns."><Matrix rows={data.map(d=>[d.state,formatCurrency(d.revenue,true),formatCompactNumber(d.orders)])} heads={['State','Revenue','Orders']} /></Panel></div>
}

function Revenue({
  data,
  categories,
}: {
  data: { period: string; revenue: number }[]
  categories: {
    category: string
    revenue: number
    unitsSold: number
  }[]
}) {
  const contribution = withOther(categories, 15)
  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
      <Panel title="Revenue trend" text="Monthly revenue trend keeps change points and seasonality readable." className="xl:col-span-2"><TrendChart values={data.map(d=>d.revenue)} labels={data.map(d=>d.period)} area /></Panel>
      <Panel title="Revenue change analysis" text="Monthly change bars show gains and declines without compressed labels." className="xl:col-span-2">
        <ChangeBars
          values={data
            .slice(1)
            .map((d, i) => d.revenue - data[i].revenue)}
          labels={data.slice(1).map((d) => d.period)}
        />
      </Panel>

      <Panel title="Seasonality heatmap" text="Daily intensity makes recurring demand patterns visible."><Density values={data.map(d=>d.revenue)} labels={data.map(d=>d.period)} /></Panel>
      <Panel title="Revenue contribution" text="Top 15 categories plus Other identify the commercial drivers behind the trend."><HorizontalBars data={contribution.map(d=>({label:d.category,value:d.revenue}))} formatValue={v=>formatCurrency(v,true)} /></Panel>
      <Panel title="Revenue versus volume" text="Category scale and revenue reveal high-value versus high-velocity drivers."><ScatterPlot points={categories.map(d=>({label:d.category,x:d.unitsSold,y:d.revenue}))} /></Panel>
    </div>
  )
}

function Sellers({ data }: { data:{sellerId:string;revenue:number;ordersFulfilled:number}[] }) {
  const tiers = sellerTiers(data)
  return <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
    <Panel title="Revenue concentration" text="Ranked sellers show where commercial dependence is concentrated."><HorizontalBars data={data.map(d=>({label:d.sellerId,value:d.revenue}))} formatValue={v=>formatCurrency(v,true)} /></Panel>
    <Panel title="Seller tier segmentation" text="Revenue tiers convert the long tail into a clear coverage view."><Density values={tiers.map(tier=>tier.count)} labels={tiers.map(tier=>tier.label)} /></Panel>
    <Panel title="Seller contribution curve" text="Cumulative contribution shows dependency on the top seller cohort."><ParetoChart data={data.map(d=>({label:d.sellerId,value:d.revenue}))} /></Panel>
    <Panel title="Seller leaderboard" text="Decision-ready performance detail for the highest-value sellers."><Matrix rows={data.map((d,i)=>[`#${i+1}`,d.sellerId,formatCurrency(d.revenue,true),formatNumber(d.ordersFulfilled)])} heads={['Rank','Seller','Revenue','Orders']} /></Panel>
  </div>
}

function Categories({ data }: { data:{category:string;revenue:number;unitsSold:number}[] }) {
  const top = withOther(data, 15)
  return <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
    <Panel title="Top category revenue ranking" text="Top 15 categories provide a readable executive ranking."><HorizontalBars data={top.map(d=>({label:d.category,value:d.revenue}))} formatValue={v=>formatCurrency(v,true)} /></Panel>
    <Panel title="Pareto concentration" text="Bars show category revenue; the line shows cumulative contribution."><ParetoChart data={top.map(d=>({label:d.category,value:d.revenue}))} /></Panel>
    <Panel title="Category momentum" text="Units sold against revenue distinguishes scale from value momentum."><ScatterPlot points={data.map(d=>({label:d.category,x:d.unitsSold,y:d.revenue}))} /></Panel>
    <Panel title="Category lifecycle" text="Detailed lifecycle comparison remains available for every category."><Matrix rows={data.map(d=>[d.category,formatCurrency(d.revenue,true),formatNumber(d.unitsSold)])} heads={['Category','Revenue','Units']} /></Panel>
    <Panel title="Category share detail" text="A ranked table makes the category mix easier to compare than proportional tiles."><Matrix rows={top.map((d, i)=>[`#${i + 1}`, d.category, formatCurrency(d.revenue, true)])} heads={['Rank', 'Category', 'Revenue']} /></Panel>
  </div>
}

function Payments({ data }: { data:{type:string;count:number;percentage:number}[] }) {
  return <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
    <Panel title="Payment flow" text="Customer payment methods flowing into completed value."><div className="flex flex-wrap items-center justify-center gap-3 pt-12">{data.map((d,i)=><span key={d.type} className="contents"><span className="rounded border border-red-900 bg-[#301114] px-3 py-2 text-xs">{d.type}</span>{i<data.length-1&&<span className="text-amber-500">→</span>}</span>)}</div></Panel>
    <Panel title="Payment composition" text="Method mix, ranked by its share of payments."><HorizontalBars data={data.map(d=>({label:d.type,value:d.percentage}))} formatValue={v=>`${Math.round(v)}%`} /></Panel>
    <Panel title="Payment behavior segmentation" text="Observed volume and share per method."><Matrix rows={data.map(d=>[d.type,formatNumber(d.count),`${d.percentage}%`])} heads={['Method','Payments','Share']} /></Panel>
    <Panel title="Payment risk distribution" text="Low-share methods are highlighted for review."><Density values={data.map(d=>d.percentage)} labels={data.map(d=>d.type)} /></Panel>
  </div>
}

function Funnel({ data }: { data:{stage:string;count:number}[] }) {
  return <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
    <Panel title="Customer journey flow" text="Sankey-style progression through each journey stage."><div className="space-y-3 pt-4">{data.map((d,i)=><div key={d.stage}><div className="flex justify-between text-sm"><span>{d.stage}</span><span>{formatCompactNumber(d.count)}</span></div><div className="mt-1 h-7 bg-gradient-to-r from-[#7F1D1D] to-[#F97316]" style={{width:`${Math.max(24,100-i*16)}%`}} /></div>)}</div></Panel>
    <Panel title="Stage leakage" text="Loss from one customer stage to the next." className="xl:col-span-2"><Waterfall values={data.slice(1).map((d,i)=>d.count-data[i].count)} labels={data.slice(1).map(d=>d.stage)} /></Panel>
    <Panel title="Cohort retention" text="Stage retention intensity grid."><Density values={data.map(d=>d.count)} labels={data.map(d=>d.stage)} /></Panel>
    <Panel title="Drop-off explorer" text="Largest journey losses for investigation."><Matrix rows={data.slice(1).map((d,i)=>[d.stage,formatNumber(Math.max(0,data[i].count-d.count))])} heads={['Stage','Lost customers']} /></Panel>
  </div>
}

function Panel({ title, text, children, className }: { title: string; text: string; children: React.ReactNode; className?: string }) {
  return <ObservabilityCard title={title} description={text} className={className}>{children}</ObservabilityCard>
}

function withOther<T extends { category: string; revenue: number }>(items: T[], limit: number) {
  const leading = items.slice(0, limit)
  const otherRevenue = items.slice(limit).reduce((sum, item) => sum + item.revenue, 0)
  return otherRevenue ? [...leading, { category: 'Other', revenue: otherRevenue }] : leading
}

function sellerTiers(items: { revenue: number }[]) {
  const values = items.map(item => item.revenue).sort((a, b) => a - b)
  const at = (percentile: number) => values[Math.max(0, Math.ceil(values.length * percentile) - 1)] ?? 0
  const [bronze, silver, gold] = [at(.25), at(.5), at(.75)]
  const counts = [0, 0, 0, 0]
  items.forEach(item => { const tier = item.revenue <= bronze ? 3 : item.revenue <= silver ? 2 : item.revenue <= gold ? 1 : 0; counts[tier]++ })
  return ['Platinum', 'Gold', 'Silver', 'Bronze'].map((label, index) => ({ label, count: counts[index] }))
}
