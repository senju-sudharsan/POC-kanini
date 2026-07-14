import { useQuery } from '@tanstack/react-query'
import { getSellerPerformance } from '@/services/analyticsApi'
import { queryKeys } from '@/lib/queryKeys'

export function useSellerPerformance(limit = 25, offset = 0, sort = 'revenue_desc') {
  return useQuery({
    queryKey: queryKeys.analytics.sellerPerformance(limit, offset, sort),
    queryFn: () => getSellerPerformance(limit, offset, sort),
    staleTime: 5 * 60 * 1000,
  })
}
