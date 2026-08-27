import { http } from './http'

export interface LoginResult {
  token: string
  username: string
}

export const AuthApiClient = {
  // POST /api/auth/login — exchanges username/password for a signed JWT.
  login: async (username: string, password: string, signal?: AbortSignal): Promise<LoginResult> => {
    return http<LoginResult>(
      '/api/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      },
      signal,
    )
  },
}
