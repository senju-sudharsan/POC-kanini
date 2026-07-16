import { apiGet } from './apiClient'
import type {
  IntegrityChecksResponse,
  QualityScoreResponse,
  RowCountsResponse,
  ValidationResultsResponse,
  QualitySummaryResponse,
  QualityHistoryResponse,
} from '@/types/quality'

export function getValidationResults(): Promise<ValidationResultsResponse> {
  return apiGet<ValidationResultsResponse>('/api/v1/quality/validation-results')
}

export function getQualitySummary(): Promise<QualitySummaryResponse> {
  return apiGet<QualitySummaryResponse>('/api/v1/quality/summary')
}

export function getQualityHistory(): Promise<QualityHistoryResponse> {
  return apiGet<QualityHistoryResponse>('/api/v1/quality/history')
}

export function getRowCounts(): Promise<RowCountsResponse> {
  return apiGet<RowCountsResponse>('/api/v1/quality/row-counts')
}

export function getIntegrityChecks(): Promise<IntegrityChecksResponse> {
  return apiGet<IntegrityChecksResponse>('/api/v1/quality/integrity-checks')
}

export function getQualityScore(): Promise<QualityScoreResponse> {
  return apiGet<QualityScoreResponse>('/api/v1/quality/score')
}
