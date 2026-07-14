import { useQuery } from '@tanstack/react-query'
import { getIntegrityChecks } from '@/services/qualityApi'
import { queryKeys } from '@/lib/queryKeys'

export function useIntegrityChecks() {
  return useQuery({
    queryKey: queryKeys.quality.integrityChecks(),
    queryFn: getIntegrityChecks,
    staleTime: 5 * 60 * 1000,
  })
}
