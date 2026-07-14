import { apiGet } from './apiClient'
import type {
  IntegrityChecksResponse,
  QualityScoreResponse,
  RowCountsResponse,
  ValidationResultsResponse,
} from '@/types/quality'

export function getValidationResults(): Promise<ValidationResultsResponse> {
  return apiGet<ValidationResultsResponse>('/api/v1/quality/validation-results')
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
