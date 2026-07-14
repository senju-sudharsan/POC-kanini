import { Link } from 'react-router-dom'
import { usePipelineStatus } from '../hooks/usePipelineStatus'
import { Badge } from '@/components/ui/badge'
import { formatRelativeTime, formatAbsoluteTime } from '@/lib/formatters'
import type { PipelineRunStatus } from '@/types/overview'

const STATUS_LABEL: Record<PipelineRunStatus, string> = {
  success: 'Healthy',
  running: 'Running',
  failed: 'Failed',
  warning: 'Warning',
}

const STATUS_VARIANT: Record<PipelineRunStatus, 'success' | 'accent' | 'danger' | 'warning'> = {
  success: 'success',
  running: 'accent',
  failed: 'danger',
  warning: 'warning',
}

export function PipelineStatusBadge() {
  const { data, isLoading, isError } = usePipelineStatus()

  if (isLoading) {
    return <div className="h-6 w-24 animate-pulse rounded-full bg-[var(--color-surface-3)]" />
  }

  if (isError || !data) {
    return (
      <Link to="/pipeline">
        <Badge variant="neutral" dot>
          Status unavailable
        </Badge>
      </Link>
    )
  }

  return (
    <Link to="/pipeline" title={formatAbsoluteTime(data.lastRunAt)}>
      <Badge variant={STATUS_VARIANT[data.status]} dot>
        {STATUS_LABEL[data.status]} · {formatRelativeTime(data.lastRunAt)}
      </Badge>
    </Link>
  )
}
