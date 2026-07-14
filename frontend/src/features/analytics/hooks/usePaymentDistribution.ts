import { useQuery } from '@tanstack/react-query'
import { getPaymentDistribution } from '@/services/analyticsApi'
import { queryKeys } from '@/lib/queryKeys'

export function usePaymentDistribution() {
  return useQuery({
    queryKey: queryKeys.analytics.paymentDistribution(),
    queryFn: getPaymentDistribution,
    staleTime: 5 * 60 * 1000,
  })
}
