import { useQuery } from '@tanstack/react-query'
import { getOverviewArchitecture, getOverviewSummary } from '@/services/overviewApi'
import { queryKeys } from '@/lib/queryKeys'

export function useOverviewSummary() {
  return useQuery({
    queryKey: queryKeys.overview.summary(),
    queryFn: getOverviewSummary,
    staleTime: 5 * 60 * 1000, // gold/silver counts change slowly — 5 min
  })
}

export function useOverviewArchitecture() {
  return useQuery({
    queryKey: queryKeys.overview.architecture(),
    queryFn: getOverviewArchitecture,
    staleTime: 30 * 60 * 1000, // structural metadata, rarely changes
  })
}
