import { apiGet } from './apiClient'
import type { BatchDetailResponse, BatchHistoryResponse, LatestBatchResponse } from '@/types/pipeline'

export function getLatestBatch(): Promise<LatestBatchResponse> {
  return apiGet<LatestBatchResponse>('/api/v1/pipeline/latest-batch')
}

export function getBatchHistory(limit = 20, offset = 0): Promise<BatchHistoryResponse> {
  return apiGet<BatchHistoryResponse>('/api/v1/pipeline/batch-history', { limit, offset })
}

export function getBatchDetail(batchId: string): Promise<BatchDetailResponse> {
  return apiGet<BatchDetailResponse>(`/api/v1/pipeline/batches/${encodeURIComponent(batchId)}`)
}
