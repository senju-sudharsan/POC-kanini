import { apiGet } from './apiClient'
import type {
  PaymentDistributionResponse,
  RevenueTrendGranularity,
  RevenueTrendResponse,
  SellerPerformanceResponse,
  TopCategoriesResponse,
} from '@/types/analytics'

export function getRevenueTrend(
  granularity: RevenueTrendGranularity = 'month'
): Promise<RevenueTrendResponse> {
  return apiGet<RevenueTrendResponse>('/api/v1/analytics/revenue-trend', { granularity })
}

export function getTopCategories(limit = 10): Promise<TopCategoriesResponse> {
  return apiGet<TopCategoriesResponse>('/api/v1/analytics/top-categories', { limit })
}

export function getSellerPerformance(
  limit = 25,
  offset = 0,
  sort = 'revenue_desc'
): Promise<SellerPerformanceResponse> {
  return apiGet<SellerPerformanceResponse>('/api/v1/analytics/seller-performance', {
    limit,
    offset,
    sort,
  })
}

export function getPaymentDistribution(): Promise<PaymentDistributionResponse> {
  return apiGet<PaymentDistributionResponse>('/api/v1/analytics/payment-distribution')
}
