import { useQuery } from '@tanstack/react-query'
import { getOverviewPipelineStatus } from '@/services/overviewApi'
import { queryKeys } from '@/lib/queryKeys'

export function usePipelineStatus() {
  return useQuery({
    queryKey: queryKeys.overview.pipelineStatus(),
    queryFn: getOverviewPipelineStatus,
    staleTime: 60 * 1000, // real refresh cadence for run status
    refetchInterval: 60 * 1000,
  })
}
