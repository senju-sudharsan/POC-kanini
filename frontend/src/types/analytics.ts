import type { Pagination } from './api'

export type RevenueTrendGranularity = 'day' | 'week' | 'month'

export interface RevenueTrendPoint {
  period: string
  revenue: number
}

export interface RevenueTrendResponse {
  granularity: RevenueTrendGranularity
  points: RevenueTrendPoint[]
}

export interface TopCategory {
  category: string
  unitsSold: number
  revenue: number
}

export interface TopCategoriesResponse {
  categories: TopCategory[]
}

export interface SellerPerformanceRecord {
  sellerId: string
  ordersFulfilled: number
  revenue: number
  avgReviewScore: number
}

export interface SellerPerformanceResponse {
  sellers: SellerPerformanceRecord[]
  pagination: Pagination
}

export interface PaymentMethodDistribution {
  type: string
  count: number
  percentage: number
}

export interface PaymentDistributionResponse {
  methods: PaymentMethodDistribution[]
}
