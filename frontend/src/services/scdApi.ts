import { apiGet } from './apiClient'
import type { CustomerSCDHistoryResponse, SCDSummaryResponse } from '@/types/scd'

export function getSCDSummary(): Promise<SCDSummaryResponse> {
  return apiGet<SCDSummaryResponse>('/api/v1/scd/summary')
}

export function getCustomerSCDHistory(customerId: string): Promise<CustomerSCDHistoryResponse> {
  return apiGet<CustomerSCDHistoryResponse>(`/api/v1/scd/history/${encodeURIComponent(customerId)}`)
}
