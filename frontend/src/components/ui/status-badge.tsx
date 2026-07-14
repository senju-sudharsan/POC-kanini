import { Badge } from '@/components/ui/badge'
import type { ValidationStatus } from '@/types/medallion'
import type { PipelineRunStatus } from '@/types/overview'
import type { CheckStatus } from '@/types/quality'

type StatusBadgeValue = CheckStatus | PipelineRunStatus | ValidationStatus

interface StatusBadgeProps {
  status: StatusBadgeValue
  label?: string
}

const STATUS_VARIANT: Record<StatusBadgeValue, 'success' | 'warning' | 'danger' | 'accent'> = {
  passed: 'success',
  success: 'success',
  warning: 'warning',
  failed: 'danger',
  running: 'accent',
}

export function StatusBadge({ status, label = status }: StatusBadgeProps) {
  return (
    <Badge variant={STATUS_VARIANT[status]} dot>
      {label}
    </Badge>
  )
}
