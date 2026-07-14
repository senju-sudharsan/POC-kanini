import { useQuery } from '@tanstack/react-query'
import { getRevenueTrend } from '@/services/analyticsApi'
import { queryKeys } from '@/lib/queryKeys'
import type { RevenueTrendGranularity } from '@/types/analytics'

export function useRevenueTrend(granularity: RevenueTrendGranularity = 'month') {
  return useQuery({
    queryKey: queryKeys.analytics.revenueTrend(granularity),
    queryFn: () => getRevenueTrend(granularity),
    staleTime: 5 * 60 * 1000, // gold-layer analytics, slower cadence
  })
}
