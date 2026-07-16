import { ApiError, type ApiErrorEnvelope, type ApiSuccessEnvelope, type FastApiErrorEnvelope } from '@/types/api'

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

/**
 * The only place a raw fetch() call is made in the app.
 * Every services/*Api.ts function calls apiGet and returns the typed `data` payload.
 *
 * Responsibilities kept here:
 *  - resolving the base URL
 *  - attaching headers
 *  - normalizing non-2xx / network failures into ApiError
 *
 * Explicitly NOT here: retries, caching, business logic — those belong to
 * React Query configuration in app/queryClient.ts and per-hook options.
 */
export async function apiGet<T>(
  path: string,
  params?: Record<string, string | number | undefined>
): Promise<T> {
  const url = new URL(`${BASE_URL}${path}`, window.location.origin)

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) {
        url.searchParams.set(key, String(value))
      }
    }
  }

  let response: Response
  try {
    response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    })
  } catch {
    throw new ApiError('Unable to reach the server. Check your connection and try again.', 'NETWORK_ERROR', 0)
  }

  let body: unknown
  try {
    body = await response.json()
  } catch {
    throw new ApiError('The server returned an unreadable response.', 'INVALID_RESPONSE', response.status)
  }

  if (!response.ok) {
    const errorBody = body as ApiErrorEnvelope
    const fastApiBody = body as FastApiErrorEnvelope
    throw new ApiError(
      errorBody?.error?.message ?? fastApiBody?.detail ?? 'Something went wrong on the server.',
      errorBody?.error?.code ?? 'UNKNOWN_ERROR',
      response.status
    )
  }

  const successBody = body as ApiSuccessEnvelope<T>
  return successBody.data
}
