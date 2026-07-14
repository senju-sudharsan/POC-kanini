import { useQuery } from '@tanstack/react-query'
import { getMedallionLayers } from '@/services/medallionApi'
import { queryKeys } from '@/lib/queryKeys'

export function useMedallionLayers() {
  return useQuery({
    queryKey: queryKeys.medallion.layers(),
    queryFn: getMedallionLayers,
    staleTime: 5 * 60 * 1000,
  })
}
