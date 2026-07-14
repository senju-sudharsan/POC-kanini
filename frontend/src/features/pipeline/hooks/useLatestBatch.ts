import { useQuery } from '@tanstack/react-query'
import { getLatestBatch } from '@/services/pipelineApi'
import { queryKeys } from '@/lib/queryKeys'

export function useLatestBatch() {
  return useQuery({
    queryKey: queryKeys.pipeline.latestBatch(),
    queryFn: getLatestBatch,
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000,
  })
}
