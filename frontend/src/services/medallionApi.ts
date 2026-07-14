import { apiGet } from './apiClient'
import type { MedallionLayersResponse, MedallionTableDetailResponse } from '@/types/medallion'

export function getMedallionLayers(): Promise<MedallionLayersResponse> {
  return apiGet<MedallionLayersResponse>('/api/v1/medallion/layers')
}

export function getMedallionTableDetail(
  layerId: string,
  tableName: string
): Promise<MedallionTableDetailResponse> {
  return apiGet<MedallionTableDetailResponse>(
    `/api/v1/medallion/layers/${encodeURIComponent(layerId)}/tables/${encodeURIComponent(tableName)}`
  )
}
