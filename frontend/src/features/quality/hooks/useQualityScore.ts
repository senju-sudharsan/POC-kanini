import { useQuery } from '@tanstack/react-query'
import { getQualityScore } from '@/services/qualityApi'
import { queryKeys } from '@/lib/queryKeys'

export function useQualityScore() {
  return useQuery({
    queryKey: queryKeys.quality.score(),
    queryFn: getQualityScore,
    staleTime: 5 * 60 * 1000,
  })
}
