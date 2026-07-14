import { useQuery } from '@tanstack/react-query'
import { getSellerPerformance } from '@/services/analyticsApi'
import { queryKeys } from '@/lib/queryKeys'

export function useSellerPerformance(limit = 10) {
  return useQuery({
    queryKey: queryKeys.analytics.sellerPerformance(limit),
    queryFn: () => getSellerPerformance(limit),
    staleTime: 5 * 60 * 1000,
  })
}
