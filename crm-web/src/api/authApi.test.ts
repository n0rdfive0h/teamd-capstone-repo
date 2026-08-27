import { AuthApiClient } from './authApi'
import { describe, beforeEach, vi, it, expect } from 'vitest'

describe('AuthApiClient', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('returns the token and username on a 200 login', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({ token: 'header.payload.signature', username: 'agent1' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    )

    const result = await AuthApiClient.login('agent1', 'password')

    expect(result).toEqual({ token: 'header.payload.signature', username: 'agent1' })
  })

  it('POSTs the credentials to /api/auth/login', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ token: 't', username: 'agent1' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    await AuthApiClient.login('agent1', 'password')

    const [url, requestInit] = fetchSpy.mock.calls[0]
    expect(String(url)).toContain('/api/auth/login')
    expect(requestInit?.method).toBe('POST')
    expect(JSON.parse(requestInit?.body as string)).toEqual({ username: 'agent1', password: 'password' })
  })

  it('rejects with a 401 ApiError on bad credentials', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          type: 'about:blank',
          title: 'Unauthorized',
          status: 401,
          detail: 'Invalid username or password',
          instance: '/api/auth/login',
        }),
        { status: 401, headers: { 'Content-Type': 'application/json' } },
      ),
    )

    await expect(AuthApiClient.login('agent1', 'nope')).rejects.toMatchObject({
      kind: 'http',
      status: 401,
    })
  })
})
