import { useQuery } from '@tanstack/react-query'
import { getMedallionTableDetail } from '@/services/medallionApi'
import { queryKeys } from '@/lib/queryKeys'

export function useLayerTableDetail(layerId: string | undefined, tableName: string | undefined) {
  return useQuery({
    queryKey: queryKeys.medallion.tableDetail(layerId ?? '', tableName ?? ''),
    queryFn: () => getMedallionTableDetail(layerId!, tableName!),
    enabled: Boolean(layerId && tableName),
    staleTime: 5 * 60 * 1000,
  })
}
