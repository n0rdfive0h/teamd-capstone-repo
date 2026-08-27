// **********************************
// borrowed from lab
// **********************************
import { ApiError } from "./ApiError"
import type { ProblemDetail } from "../types/problemdetail"
import { readStoredSession } from "./session"

const baseUrl = import.meta.env.VITE_API_BASE_URL as string

function authHeaders(): Record<string, string> {
  // Attach the JWT from the current session, if signed in. `/api/auth/login`
  // itself is unauthenticated, so sending nothing there is harmless.
  const session = readStoredSession()
  return session ? { Authorization: `Bearer ${session.token}` } : {}
}

export async function http<T>(
  path: string,
  init: RequestInit = {},
  signal?: AbortSignal,
): Promise<T> {
  try {
    const response = await fetch(`${baseUrl}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
        ...init.headers, // caller-specific headers (e.g. X-Correlation-Id) win last
      },
      signal,
    })

    if (response.status === 204) {
      return undefined as T
    }

    if (!response.ok) {
      let problem: ProblemDetail | null = null
      try {
        problem = await response.json() as ProblemDetail
      } catch {
        // no JSON body at all — fall through to a generic message below
      }

      const message = problem?.detail || problem?.title || `Request failed with status ${response.status}`
      throw new ApiError(message, 'http', response.status)
    }

    try {
      return await response.json() as T
    } catch {
      throw new ApiError('Failed to parse successful server response', 'parse')
    }

  } catch (error: unknown) {
    if (error instanceof ApiError) {
      throw error
    }
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ApiError('Request was intentionally cancelled', 'abort')
    }
    const message = error instanceof Error ? error.message : 'A network error occurred. Please check your connection.'
    throw new ApiError(message, 'network')
  }
}
