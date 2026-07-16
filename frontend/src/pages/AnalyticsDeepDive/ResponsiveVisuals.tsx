import { formatCompactNumber } from '@/lib/formatters'
import { cn } from '@/lib/utils'

const WARM = ['#7F1D1D', '#DC2626', '#C2410C', '#D97706', '#FB7185']

/** Shared deep-dive visual primitives. Each establishes a readable minimum item size; overflow scrolls rather than compressing content. */
export function Matrix({ heads, rows }: { heads: string[]; rows: string[][] }) {
  return <div className="max-h-[34rem] overflow-auto rounded-md border border-red-950/45">
    <table className="min-w-max w-full border-separate border-spacing-0 text-left text-xs">
      <thead className="sticky top-0 z-10 bg-[#1a0e10] text-[var(--color-text-muted)]"><tr>{heads.map((h, i) => <th key={h} className={cn('border-b border-red-950/60 px-3 py-3 font-medium', i === 0 ? 'min-w-52' : 'min-w-32')}>{h}</th>)}</tr></thead>
      <tbody className="divide-y divide-red-950/40">{rows.map((row, i) => <tr key={i} className="hover:bg-red-950/15">{row.map((value, j) => <td key={j} className="max-w-72 break-words px-3 py-2.5 leading-relaxed text-[var(--color-text-secondary)]">{value}</td>)}</tr>)}</tbody>
    </table>
  </div>
}

export function Density({ values, labels = [] }: { values: number[]; labels?: string[] }) {
  const max = Math.max(...values, 1)
  return <div className="grid gap-2 [grid-template-columns:repeat(auto-fit,minmax(145px,1fr))]">
    {values.map((value, index) => <div key={`${labels[index] ?? 'value'}-${index}`} className="flex min-h-24 min-w-0 flex-col justify-between rounded-md p-3 text-white" style={{ backgroundColor: WARM[Math.min(4, Math.floor((value / max) * 4))] }}>
      <span className="break-words text-xs leading-snug text-white/85">{labels[index] ?? 'Share'}</span>
      <span className="mt-2 text-sm font-semibold tabular-nums">{labels[index] ? formatCompactNumber(value) : `${Math.round((value / max) * 100)}%`}</span>
    </div>)}
  </div>
}

export function Blocks({ data, formatValue }: { data: { label: string; value: number }[]; formatValue?: (value: number) => string }) {
  const sorted = [...data].sort((a, b) => b.value - a.value)
  const largest = Math.max(...sorted.map(item => item.value), 1)
  const format = formatValue ?? formatCompactNumber
  return <div className="grid auto-rows-[88px] grid-flow-dense gap-2 [grid-template-columns:repeat(auto-fit,minmax(150px,1fr))]">
    {sorted.map((item, index) => {
      const ratio = item.value / largest
      // Larger contributors receive more visual area, but every tile keeps a usable 150px minimum width.
      const prominent = ratio >= 0.55 && sorted.length <= 25
      return <div key={`${item.label}-${index}`} className={cn('flex min-w-0 flex-col justify-between overflow-hidden rounded-md p-3 text-white', prominent && 'sm:col-span-2 sm:row-span-2')} style={{ backgroundColor: WARM[index % WARM.length] }}>
        <span className="break-words text-xs font-medium leading-snug">{item.label}</span>
        <span className="mt-2 text-sm font-semibold tabular-nums text-white/90">{format(item.value)}</span>
      </div>
    })}
  </div>
}

export function Waterfall({ values, labels, compact = false }: { values: number[]; labels: string[]; compact?: boolean }) {
  const count = values.length
  const max = Math.max(...values.map(Math.abs), 1)
  // Limit both labels and values to six marks at this width. More labels make
  // monthly dates collide and obscure the bars they are meant to explain.
  const labelEvery = count > 12 ? Math.ceil(count / 6) : 1
  const valueEvery = count > 12 ? Math.ceil(count / 6) : 1
  const plotHeight = compact ? 150 : Math.min(360, Math.max(220, 170 + Math.ceil(count / 20) * 30))
  const minWidth = compact ? Math.max(640, count * 52) : Math.max(720, count * 72)
  const barWidth = compact ? 'w-10' : 'w-14'
  const gap = compact ? 'gap-3' : 'gap-4'
  const shortLabel = (label: string) => /^\d{4}-\d{2}/.test(label) ? label.slice(0, 7) : label
  const valueLabel = (value: number) => `${value >= 0 ? '+' : ''}${formatCompactNumber(value)}`
  return <div className="w-full overflow-x-auto overscroll-x-contain pb-2">
    <div className="px-2" style={{ minWidth }}>
      <div className={`flex items-end ${gap} border-b border-red-950/50`} style={{ height: plotHeight }}>
        {values.map((value, index) => <div key={`${labels[index]}-${index}`} className={`flex ${barWidth} shrink-0 flex-col items-center justify-end`}>
          <span className="mb-2 h-4 whitespace-nowrap text-[10px] tabular-nums text-[var(--color-text-muted)]">{index % valueEvery === 0 ? valueLabel(value) : ''}</span>
          <div className={cn('w-full rounded-t-sm shadow-[0_0_12px_rgba(220,38,38,.16)]', value >= 0 ? 'bg-[#DC2626]' : 'bg-[#D97706]')} style={{ height: Math.max(10, Math.round(Math.abs(value) / max * (plotHeight - 40))) }} />
        </div>)}
      </div>
      <div className={`flex ${gap} pt-2`} style={{ minHeight: compact ? 48 : 64 }}>
        {labels.map((label, index) => <div key={`${label}-axis-${index}`} className={`${barWidth} shrink-0`}>{index % labelEvery === 0 && <span className="block origin-top-left whitespace-nowrap text-[10px] text-[var(--color-text-muted)]" style={{ transform: 'rotate(-42deg)' }}>{shortLabel(label)}</span>}</div>)}
      </div>
    </div>
  </div>
}

/** Chronological, responsive alternative to a cramped waterfall chart. */
export function ChangeBars({ values, labels }: { values: number[]; labels: string[] }) {
  const max = Math.max(...values.map(Math.abs), 1)
  const month = (label: string) => /^\d{4}-\d{2}/.test(label) ? label.slice(0, 7) : label
  return <div className="grid max-h-[30rem] grid-cols-1 gap-x-6 gap-y-1 overflow-y-auto pr-1 lg:grid-cols-2">
    {values.map((value, index) => {
      const width = Math.max(2, Math.abs(value) / max * 50)
      const positive = value >= 0
      return <div key={`${labels[index]}-${index}`} className="grid grid-cols-[4.5rem_minmax(10rem,1fr)_4.5rem] items-center gap-2 py-1.5 text-xs">
        <span className="tabular-nums text-[var(--color-text-muted)]">{month(labels[index] ?? '')}</span>
        <div className="relative h-5 rounded-sm bg-red-950/25"><span className="absolute left-1/2 top-0 h-full w-px bg-red-950/80" />
          <span className={cn('absolute top-1/2 h-3 -translate-y-1/2 rounded-sm', positive ? 'left-1/2 bg-[#DC2626]' : 'right-1/2 bg-[#D97706]')} style={{ width: `${width}%` }} />
        </div>
        <span className={cn('text-right tabular-nums', positive ? 'text-red-200' : 'text-amber-300')}>{value >= 0 ? '+' : ''}{formatCompactNumber(value)}</span>
      </div>
    })}
  </div>
}

function axisLabel(label: string) { return /^\d{4}-\d{2}/.test(label) ? label.slice(5, 10) : label }

/** A scroll-safe SVG trend chart: large time series retain a constant point pitch instead of squeezing labels. */
export function TrendChart({ values, labels, area = false }: { values: number[]; labels: string[]; area?: boolean }) {
  const width = Math.max(760, values.length * 28); const height = 270; const pad = { x: 40, y: 20, bottom: 38 }
  const max = Math.max(...values, 1); const min = Math.min(...values, 0); const range = Math.max(max - min, 1)
  const x = (i: number) => pad.x + i * ((width - pad.x * 2) / Math.max(values.length - 1, 1)); const y = (v: number) => pad.y + (max - v) / range * (height - pad.y - pad.bottom)
  const line = values.map((value, i) => `${i ? 'L' : 'M'}${x(i)},${y(value)}`).join(' ')
  const step = values.length > 24 ? Math.ceil(values.length / 8) : Math.max(1, Math.ceil(values.length / 10))
  return <div className="overflow-x-auto"><svg width={width} height={height} className="block"><defs><linearGradient id="deepDiveArea" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#DC2626" stopOpacity=".42" /><stop offset="1" stopColor="#7F1D1D" stopOpacity=".03" /></linearGradient></defs><line x1={pad.x} x2={width - pad.x} y1={height - pad.bottom} y2={height - pad.bottom} stroke="#4a171a" />{area && <path d={`${line} L${x(values.length - 1)},${height - pad.bottom} L${x(0)},${height - pad.bottom} Z`} fill="url(#deepDiveArea)" />}<path d={line} fill="none" stroke="#EF4444" strokeWidth="3" />{values.map((value, i) => <g key={i}>{i % step === 0 && <><circle cx={x(i)} cy={y(value)} r="3" fill="#FB7185" /><text x={x(i)} y={height - 12} textAnchor="middle" fill="#a89a9a" fontSize="10">{axisLabel(labels[i] ?? '')}</text></>}</g>)}</svg></div>
}

export function HorizontalBars({ data, formatValue = formatCompactNumber }: { data: { label: string; value: number }[]; formatValue?: (value: number) => string }) {
  const rows = data.slice(0, 20); const max = Math.max(...rows.map(row => row.value), 1)
  return <div className="max-h-[34rem] overflow-auto pr-1">{rows.map((row, index) => <div key={`${row.label}-${index}`} className="grid min-w-[420px] grid-cols-[minmax(11rem,1fr)_minmax(12rem,2fr)_4.5rem] items-center gap-3 border-b border-red-950/35 py-2"><span className="break-words text-xs text-[var(--color-text-secondary)]">{row.label}</span><div className="h-5 overflow-hidden rounded-sm bg-red-950/35"><div className="h-full rounded-sm bg-gradient-to-r from-[#7F1D1D] to-[#EF4444]" style={{ width: `${Math.max(3, row.value / max * 100)}%` }} /></div><span className="text-right text-xs tabular-nums text-red-100">{formatValue(row.value)}</span></div>)}</div>
}

export function ParetoChart({ data }: { data: { label: string; value: number }[] }) {
  const rows = data.slice(0, 30); const total = rows.reduce((sum, row) => sum + row.value, 0) || 1; let cumulative = 0
  const points = rows.map((row, i) => { cumulative += row.value; return { ...row, share: cumulative / total * 100, i } })
  const width = Math.max(760, points.length * 34); const h = 270; const baseline = 224; const step = width / Math.max(points.length, 1); const labelEvery = points.length > 16 ? Math.ceil(points.length / 8) : 1
  const line = points.map(point => `${point.i ? 'L' : 'M'}${point.i * step + step / 2},${baseline - point.share * 1.8}`).join(' ')
  const max = Math.max(...points.map(point => point.value), 1)
  return <div className="overflow-x-auto"><svg width={width} height={h} className="block"><line x1="0" x2={width} y1={baseline} y2={baseline} stroke="#4a171a" />{points.map(point => <g key={point.label}><rect x={point.i * step + step * .18} y={baseline - point.value / max * 160} width={step * .64} height={point.value / max * 160} rx="2" fill="#7F1D1D" />{point.i % labelEvery === 0 && <text x={point.i * step + step / 2} y="247" textAnchor="middle" fill="#a89a9a" fontSize="10">{point.i + 1}</text>}</g>)}<path d={line} fill="none" stroke="#FB7185" strokeWidth="3" />{points.filter(point => point.i % labelEvery === 0).map(point => <circle key={point.i} cx={point.i * step + step / 2} cy={baseline - point.share * 1.8} r="3" fill="#FB7185" />)}</svg></div>
}

export function ScatterPlot({ points }: { points: { label: string; x: number; y: number }[] }) {
  const width = 660; const height = 320; const pad = { left: 62, right: 22, top: 28, bottom: 54 }; const maxX = Math.max(...points.map(point => point.x), 1); const maxY = Math.max(...points.map(point => point.y), 1)
  const plotWidth = width - pad.left - pad.right; const plotHeight = height - pad.top - pad.bottom
  const x = (value: number) => pad.left + value / maxX * plotWidth; const y = (value: number) => height - pad.bottom - value / maxY * plotHeight
  return <div className="overflow-x-auto"><svg width={width} height={height} className="block min-w-[660px]"><line x1={pad.left} x2={width - pad.right} y1={height - pad.bottom} y2={height - pad.bottom} stroke="#4a171a" /><line x1={pad.left} x2={pad.left} y1={pad.top} y2={height - pad.bottom} stroke="#4a171a" /><text x={pad.left} y={height - 18} fill="#a89a9a" fontSize="10">0</text><text x={width - pad.right} y={height - 18} textAnchor="end" fill="#a89a9a" fontSize="10">{formatCompactNumber(maxX)}</text><text x={pad.left - 8} y={height - pad.bottom} textAnchor="end" fill="#a89a9a" fontSize="10">0</text><text x={pad.left - 8} y={pad.top + 4} textAnchor="end" fill="#a89a9a" fontSize="10">{formatCompactNumber(maxY)}</text><text x={(pad.left + width - pad.right) / 2} y={height - 4} textAnchor="middle" fill="#a89a9a" fontSize="11">Units sold</text><text x="14" y={(pad.top + height - pad.bottom) / 2} textAnchor="middle" fill="#a89a9a" fontSize="11" transform={`rotate(-90 14 ${(pad.top + height - pad.bottom) / 2})`}>Revenue</text>{points.map((point, i) => <g key={`${point.label}-${i}`}><circle cx={x(point.x)} cy={y(point.y)} r="6" fill={WARM[i % WARM.length]} opacity=".85"><title>{`${point.label}: ${formatCompactNumber(point.x)} units, ${formatCompactNumber(point.y)} revenue`}</title></circle>{points.length <= 18 && <text x={x(point.x) + 8} y={y(point.y)} fill="#c6b6b6" fontSize="10">{point.label.slice(0, 12)}</text>}</g>)}</svg></div>
}
