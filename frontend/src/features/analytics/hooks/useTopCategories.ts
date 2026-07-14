import { useQuery } from '@tanstack/react-query'
import { getTopCategories } from '@/services/analyticsApi'
import { queryKeys } from '@/lib/queryKeys'

export function useTopCategories(limit = 10) {
  return useQuery({
    queryKey: queryKeys.analytics.topCategories(limit),
    queryFn: () => getTopCategories(limit),
    staleTime: 5 * 60 * 1000,
  })
}
