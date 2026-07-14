/**
 * Centralized React Query key factory.
 * Every feature hook derives its queryKey from here so invalidation
 * and caching stay consistent across the app.
 */
export const queryKeys = {
  overview: {
    summary: () => ['overview', 'summary'] as const,
    architecture: () => ['overview', 'architecture'] as const,
    pipelineStatus: () => ['overview', 'pipeline-status'] as const,
  },
  medallion: {
    layers: () => ['medallion', 'layers'] as const,
    tableDetail: (layerId: string, tableName: string) =>
      ['medallion', 'layers', layerId, 'tables', tableName] as const,
  },
  pipeline: {
    latestBatch: () => ['pipeline', 'latest-batch'] as const,
    batchHistory: (limit: number, offset: number) =>
      ['pipeline', 'batch-history', { limit, offset }] as const,
    batchDetail: (batchId: string) => ['pipeline', 'batches', batchId] as const,
  },
  analytics: {
    revenueTrend: (granularity: 'day' | 'week' | 'month') =>
      ['analytics', 'revenue-trend', granularity] as const,
    topCategories: (limit: number) => ['analytics', 'top-categories', limit] as const,
    sellerPerformance: (limit: number) =>
      ['analytics', 'seller-performance', limit] as const,
    paymentDistribution: () => ['analytics', 'payment-distribution'] as const,
  },
  scd: {
    summary: () => ['scd', 'summary'] as const,
    history: (customerId: string) => ['scd', 'history', customerId] as const,
  },
  quality: {
    validationResults: () => ['quality', 'validation-results'] as const,
    rowCounts: () => ['quality', 'row-counts'] as const,
    integrityChecks: () => ['quality', 'integrity-checks'] as const,
    score: () => ['quality', 'score'] as const,
  },
} as const
