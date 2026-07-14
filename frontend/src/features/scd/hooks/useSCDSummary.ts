import { useQuery } from '@tanstack/react-query'
import { getSCDSummary } from '@/services/scdApi'
import { queryKeys } from '@/lib/queryKeys'

export function useSCDSummary() {
  return useQuery({
    queryKey: queryKeys.scd.summary(),
    queryFn: getSCDSummary,
    staleTime: 60 * 1000,
  })
}
