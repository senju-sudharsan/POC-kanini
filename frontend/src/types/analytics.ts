export type RevenueTrendGranularity = 'day' | 'week' | 'month'

export interface RevenueTrendPoint {
  period: string
  revenue: number
}

export interface RevenueTrendResponse {
  granularity: RevenueTrendGranularity
  points: RevenueTrendPoint[]
  kpis: {
    totalRevenue: number
    totalOrders: number
    totalCustomers: number
    totalSellers: number
  }
  funnel: FunnelStage[]
  geography: GeographicRevenue[]
  dataQuality: DataQualityPosture
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
}

export interface SellerPerformanceResponse {
  sellers: SellerPerformanceRecord[]
}

export interface PaymentMethodDistribution {
  type: string
  count: number
  percentage: number
}

export interface PaymentDistributionResponse {
  methods: PaymentMethodDistribution[]
}

export interface FunnelStage {
  stage: string
  count: number
}

export interface GeographicRevenue {
  state: string
  revenue: number
  orders: number
}

export interface DataQualityPosture {
  score: number
  validationStatus: 'passed' | 'warning' | 'unknown'
  tableCounts: Record<'bronze' | 'silver' | 'gold', number>
}
