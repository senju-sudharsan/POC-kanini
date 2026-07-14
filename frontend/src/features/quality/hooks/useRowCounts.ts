import { useQuery } from '@tanstack/react-query'
import { getRowCounts } from '@/services/qualityApi'
import { queryKeys } from '@/lib/queryKeys'

export function useRowCounts() {
  return useQuery({
    queryKey: queryKeys.quality.rowCounts(),
    queryFn: getRowCounts,
    staleTime: 5 * 60 * 1000,
  })
}
