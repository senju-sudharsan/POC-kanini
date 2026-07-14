export interface MedallionTableSummary {
  name: string
  rowCount: number | null
}

export interface MedallionLayer {
  id: string
  name: string
  purpose: string
  tables: MedallionTableSummary[]
}

export interface MedallionLayersResponse {
  layers: MedallionLayer[]
}

export interface MedallionTransformation {
  step: string
  description: string
}

export type ValidationStatus = 'passed' | 'failed' | 'warning'

export interface MedallionTableValidation {
  status: ValidationStatus
  checksRun: number
  checksPassed: number
}

export interface MedallionTableDetailResponse {
  layerId: string
  tableName: string
  rowCount: number
  sourceTables: string[]
  transformations: MedallionTransformation[]
  validation: MedallionTableValidation
}
