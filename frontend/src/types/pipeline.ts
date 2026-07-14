import type { Pagination } from './api'
import type { PipelineRunStatus } from './overview'
import type { ValidationStatus } from './medallion'

export interface LatestBatchResponse {
  batchId: string
  status: PipelineRunStatus
  startedAt: string
  finishedAt: string
  durationSeconds: number
  rowsProcessed: number
  validationStatus: ValidationStatus
}

export interface BatchRecord {
  batchId: string
  status: PipelineRunStatus
  startedAt: string
  durationSeconds: number
  rowsProcessed: number
  validationStatus: ValidationStatus
}

export interface BatchHistoryResponse {
  batches: BatchRecord[]
  pagination: Pagination
}

/**
 * NOTE: API_CONTRACT.md §3 leaves this field's exact shape unconfirmed
 * ("if the backend tracks it... otherwise omit the field rather than fabricate").
 * This shape is a reasonable placeholder and must be confirmed against the
 * real backend response before BatchStepBreakdown UI is built out further.
 */
export interface BatchStepBreakdown {
  layer: string
  durationSeconds: number
  status: PipelineRunStatus
}

export interface BatchDetailResponse extends BatchRecord {
  stepBreakdown?: BatchStepBreakdown[]
}
