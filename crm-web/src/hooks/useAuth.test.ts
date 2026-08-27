import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useAuth } from './useAuth'
import { AuthApiClient } from '../api/authApi'
import { SESSION_STORAGE_KEY } from '../api/session'
import { ApiError } from '../api/ApiError'

describe('useAuth', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('starts signed out with no stored session', () => {
    const { result } = renderHook(() => useAuth())
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.username).toBeNull()
  })

  it('starts signed in when a valid session is already stored', () => {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({ username: 'agent1', token: 'jwt' }))
    const { result } = renderHook(() => useAuth())
    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.username).toBe('agent1')
  })

  it('persists the session on a successful login', async () => {
    vi.spyOn(AuthApiClient, 'login').mockResolvedValue({ token: 'jwt-123', username: 'agent1' })
    const { result } = renderHook(() => useAuth())

    await act(async () => {
      await result.current.login('agent1', 'password')
    })

    expect(result.current.isAuthenticated).toBe(true)
    expect(JSON.parse(localStorage.getItem(SESSION_STORAGE_KEY)!)).toEqual({
      username: 'agent1',
      token: 'jwt-123',
    })
  })

  it('does not store anything when login fails', async () => {
    vi.spyOn(AuthApiClient, 'login').mockRejectedValue(new ApiError('bad creds', 'http', 401))
    const { result } = renderHook(() => useAuth())

    await expect(
      act(async () => {
        await result.current.login('agent1', 'wrong')
      }),
    ).rejects.toMatchObject({ status: 401 })

    expect(result.current.isAuthenticated).toBe(false)
    expect(localStorage.getItem(SESSION_STORAGE_KEY)).toBeNull()
  })

  it('clears the session on logout', async () => {
    vi.spyOn(AuthApiClient, 'login').mockResolvedValue({ token: 'jwt-123', username: 'agent1' })
    const { result } = renderHook(() => useAuth())

    await act(async () => {
      await result.current.login('agent1', 'password')
    })
    act(() => {
      result.current.logout()
    })

    expect(result.current.isAuthenticated).toBe(false)
    expect(localStorage.getItem(SESSION_STORAGE_KEY)).toBeNull()
  })
})
