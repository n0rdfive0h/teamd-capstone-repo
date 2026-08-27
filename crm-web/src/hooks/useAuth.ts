import { useCallback, useState } from 'react'
import { AuthApiClient } from '../api/authApi'
import { ApiError } from '../api/ApiError'
import { clearStoredSession, readStoredSession, writeStoredSession } from '../api/session'

export function useAuth() {
  const [session, setSession] = useState(() => readStoredSession())

  const login = useCallback(async (username: string, password: string): Promise<void> => {
    try {
      const result = await AuthApiClient.login(username, password)
      const next = { username: result.username, token: result.token }
      writeStoredSession(next)
      setSession(next)
    } catch (e) {
      throw e instanceof ApiError ? e : new ApiError('Unknown error', 'network')
    }
  }, [])

  const logout = useCallback(() => {
    clearStoredSession()
    setSession(null)
  }, [])

  return {
    isAuthenticated: session !== null,
    username: session?.username ?? null,
    login,
    logout,
  }
}
