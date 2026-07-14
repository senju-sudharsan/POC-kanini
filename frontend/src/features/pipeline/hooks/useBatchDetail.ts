import { useQuery } from '@tanstack/react-query'
import { getBatchDetail } from '@/services/pipelineApi'
import { queryKeys } from '@/lib/queryKeys'

export function useBatchDetail(batchId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.pipeline.batchDetail(batchId ?? ''),
    queryFn: () => getBatchDetail(batchId!),
    enabled: Boolean(batchId),
    staleTime: 60 * 1000,
  })
}
