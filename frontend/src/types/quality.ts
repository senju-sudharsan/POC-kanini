export type CheckStatus = 'passed' | 'failed' | 'warning'

export interface ValidationResult {
  check: string
  status: CheckStatus
}

export interface ValidationResultsResponse {
  results: ValidationResult[]
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
