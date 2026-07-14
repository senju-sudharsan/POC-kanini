import { useQuery } from '@tanstack/react-query'
import { getValidationResults } from '@/services/qualityApi'
import { queryKeys } from '@/lib/queryKeys'

export function useValidationResults() {
  return useQuery({
    queryKey: queryKeys.quality.validationResults(),
    queryFn: getValidationResults,
    staleTime: 5 * 60 * 1000,
  })
}
