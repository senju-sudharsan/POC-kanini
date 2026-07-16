export type CheckStatus = 'passed' | 'failed' | 'warning'

export interface ValidationResult {
  check: string
  status: CheckStatus
}

export interface ValidationResultsResponse {
  results: ValidationResult[]
  validations?: GXValidation[]
}

export interface GXValidation {
  validationId: string
  dataset: string
  expectation: string
  status: CheckStatus
  unexpectedCount: number
  successPercent: number
  timestamp: string
  batchId: string | null
}

export interface QualitySummaryResponse {
  totalExpectations: number
  passed: number
  failed: number
  successRate: number
  lastValidationRun: string | null
}

export interface QualityHistoryResponse {
  trend: { timestamp: string; successRate: number; total: number }[]
}

export interface RowCountAuditEntry {
  entity: string
  bronzeCount: number
  silverCount: number
  delta: number
}

export interface RowCountsResponse {
  audits: RowCountAuditEntry[]
}

export interface IntegrityCheck {
  name: string
  status: CheckStatus
  violations: number
}

export interface IntegrityChecksResponse {
  checks: IntegrityCheck[]
}

export interface QualityScoreResponse {
  score: number
  scale: number
  computedAt: string
}
