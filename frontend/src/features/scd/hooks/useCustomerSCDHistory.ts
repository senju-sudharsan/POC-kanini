import { useQuery } from '@tanstack/react-query'
import { getCustomerSCDHistory } from '@/services/scdApi'
import { queryKeys } from '@/lib/queryKeys'

export function useCustomerSCDHistory(customerId: string) {
  return useQuery({
    queryKey: queryKeys.scd.history(customerId),
    queryFn: () => getCustomerSCDHistory(customerId),
    enabled: customerId.length > 0,
    staleTime: 60 * 1000,
    retry: false,
  })
}
