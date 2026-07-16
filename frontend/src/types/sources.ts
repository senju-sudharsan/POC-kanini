export interface SourceLoad {
  sourceName: string
  sourceType: string
  status: 'healthy' | 'unhealthy'
  recordsLoaded: number
  lastLoadTime: string | null
  batchId: string | null
  errorMessage: string | null
}

export interface SourceSummaryResponse { sources: SourceLoad[] }
export interface SourceHistoryResponse { loads: SourceLoad[] }
