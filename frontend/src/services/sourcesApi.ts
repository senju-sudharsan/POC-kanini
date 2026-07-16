import { apiGet } from './apiClient'
import type { SourceHistoryResponse, SourceSummaryResponse } from '@/types/sources'

export const getSourceSummary = () => apiGet<SourceSummaryResponse>('/api/v1/sources/summary')
export const getSourceHistory = () => apiGet<SourceHistoryResponse>('/api/v1/sources/history')
