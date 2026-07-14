export interface OverviewSummaryResponse {
  totalCustomers: number
  totalOrders: number
  totalProducts: number
  totalSellers: number
  totalPayments: number
  totalOrderFacts: number
}

export interface ArchitectureLayerSummary {
  id: string
  name: string
  description: string
  tableCount: number
}

export interface OverviewArchitectureResponse {
  layers: ArchitectureLayerSummary[]
}

export type PipelineRunStatus = 'success' | 'running' | 'failed' | 'warning'

export interface OverviewPipelineStatusResponse {
  status: PipelineRunStatus
  lastRunAt: string
  batchId: string
}
