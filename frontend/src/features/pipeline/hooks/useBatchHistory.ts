import { useQuery } from '@tanstack/react-query'
import { getBatchHistory } from '@/services/pipelineApi'
import { queryKeys } from '@/lib/queryKeys'

export function useBatchHistory(limit = 20, offset = 0) {
  return useQuery({
    queryKey: queryKeys.pipeline.batchHistory(limit, offset),
    queryFn: () => getBatchHistory(limit, offset),
    staleTime: 60 * 1000,
  })
}
