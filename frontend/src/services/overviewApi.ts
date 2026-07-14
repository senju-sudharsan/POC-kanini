import { apiGet } from './apiClient'
import type {
  OverviewArchitectureResponse,
  OverviewPipelineStatusResponse,
  OverviewSummaryResponse,
} from '@/types/overview'

export function getOverviewSummary(): Promise<OverviewSummaryResponse> {
  return apiGet<OverviewSummaryResponse>('/api/v1/overview/summary')
}

export function getOverviewArchitecture(): Promise<OverviewArchitectureResponse> {
  return apiGet<OverviewArchitectureResponse>('/api/v1/overview/architecture')
}

export function getOverviewPipelineStatus(): Promise<OverviewPipelineStatusResponse> {
  return apiGet<OverviewPipelineStatusResponse>('/api/v1/overview/pipeline-status')
}
