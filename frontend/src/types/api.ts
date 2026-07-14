/** Success envelope shared by every endpoint in API_CONTRACT.md §0. */
export interface ApiSuccessEnvelope<T> {
  data: T
  meta: {
    generatedAt: string
  }
}

/** Error envelope shared by every endpoint in API_CONTRACT.md §0. */
export interface ApiErrorEnvelope {
  error: {
    code: string
    message: string
  }
}

/** Normalized error thrown by apiClient on any non-2xx response or network failure. */
export class ApiError extends Error {
  code: string
  status: number

  constructor(message: string, code: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.status = status
  }
}

/** Shared pagination wrapper, reused across list endpoints (e.g. batch-history, seller-performance). */
export interface Pagination {
  limit: number
  offset: number
  total: number
}
