/**
 * Presentation-only formatting helpers.
 *
 * IMPORTANT: These functions format values the backend already computed.
 * They must never sum, average, join, or otherwise derive new values —
 * only change how an existing value is displayed.
 */

const numberFormatter = new Intl.NumberFormat('en-US')

const compactNumberFormatter = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 1,
})

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

const currencyFormatterPrecise = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
})

/** Formats an integer with thousands separators. Returns "—" for null/undefined. */
export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—'
  return numberFormatter.format(value)
}

/** Formats a large integer compactly, e.g. 112650 -> "112.7K". Returns "—" for null/undefined. */
export function formatCompactNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—'
  return compactNumberFormatter.format(value)
}

/** Formats a currency amount. Returns "—" for null/undefined. */
export function formatCurrency(value: number | null | undefined, precise = false): string {
  if (value === null || value === undefined) return '—'
  return precise ? currencyFormatterPrecise.format(value) : currencyFormatter.format(value)
}

/** Formats a percentage value that is already computed (e.g. 73.9 -> "73.9%"). */
export function formatPercentage(value: number | null | undefined, digits = 1): string {
  if (value === null || value === undefined) return '—'
  return `${value.toFixed(digits)}%`
}

/** Formats seconds as a human duration, e.g. 764 -> "12m 44s". */
export function formatDuration(seconds: number | null | undefined): string {
  if (seconds === null || seconds === undefined) return '—'
  const mins = Math.floor(seconds / 60)
  const secs = Math.round(seconds % 60)
  if (mins === 0) return `${secs}s`
  return `${mins}m ${secs}s`
}

/** Formats an ISO timestamp as a relative "time ago" string. */
export function formatRelativeTime(iso: string | null | undefined): string {
  if (!iso) return '—'
  const date = new Date(iso)
  const diffMs = Date.now() - date.getTime()
  const diffSec = Math.round(diffMs / 1000)
  const diffMin = Math.round(diffSec / 60)
  const diffHour = Math.round(diffMin / 60)
  const diffDay = Math.round(diffHour / 24)

  if (diffSec < 60) return diffSec <= 0 ? 'just now' : `${diffSec}s ago`
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHour < 24) return `${diffHour}h ago`
  return `${diffDay}d ago`
}

/** Formats an ISO timestamp as an absolute, human-readable string (for tooltips). */
export function formatAbsoluteTime(iso: string | null | undefined): string {
  if (!iso) return '—'
  const date = new Date(iso)
  return date.toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'medium',
  })
}
