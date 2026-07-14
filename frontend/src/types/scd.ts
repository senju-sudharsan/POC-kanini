export interface SCDSummaryResponse {
  totalRecords: number
  activeRecords: number
  historicalRecords: number
  customersWithMultipleVersions: number
  latestUpdateTimestamp: string | null
}

export interface CustomerSCDVersion {
  customerId: string
  customerCity: string | null
  customerState: string | null
  effectiveStartDate: string
  effectiveEndDate: string | null
  isCurrent: boolean
  versionNumber: number
}

export interface CustomerSCDHistoryResponse {
  customerId: string
  versions: CustomerSCDVersion[]
}
