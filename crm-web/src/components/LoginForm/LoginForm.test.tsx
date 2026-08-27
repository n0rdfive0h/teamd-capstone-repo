import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { LoginForm } from './LoginForm'
import { ApiError } from '../../api/ApiError'

describe('LoginForm', () => {
  it('disables submit until both fields are filled', async () => {
    const user = userEvent.setup()
    render(<LoginForm onLogin={vi.fn()} />)

    const submit = screen.getByRole('button', { name: /sign in/i })
    expect(submit).toBeDisabled()

    await user.type(screen.getByLabelText(/username/i), 'agent1')
    expect(submit).toBeDisabled()

    await user.type(screen.getByLabelText(/password/i), 'password')
    expect(submit).toBeEnabled()
  })

  it('calls onLogin with the trimmed username and raw password', async () => {
    const onLogin = vi.fn().mockResolvedValue(undefined)
    const user = userEvent.setup()
    render(<LoginForm onLogin={onLogin} />)

    await user.type(screen.getByLabelText(/username/i), '  agent1  ')
    await user.type(screen.getByLabelText(/password/i), 'password')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    expect(onLogin).toHaveBeenCalledWith('agent1', 'password')
  })

  it('shows an invalid-credentials message when onLogin rejects with a 401', async () => {
    const onLogin = vi.fn().mockRejectedValue(new ApiError('Invalid username or password', 'http', 401))
    const user = userEvent.setup()
    render(<LoginForm onLogin={onLogin} />)

    await user.type(screen.getByLabelText(/username/i), 'agent1')
    await user.type(screen.getByLabelText(/password/i), 'wrong')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/invalid username or password/i)
  })

  it('shows a connection message when onLogin rejects with a network error', async () => {
    const onLogin = vi.fn().mockRejectedValue(new ApiError('Network failure', 'network'))
    const user = userEvent.setup()
    render(<LoginForm onLogin={onLogin} />)

    await user.type(screen.getByLabelText(/username/i), 'agent1')
    await user.type(screen.getByLabelText(/password/i), 'password')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/can't reach the server/i)
  })

  it('disables the button while the request is in flight', async () => {
    let resolveLogin: () => void
    const onLogin = vi.fn(() => new Promise<void>(resolve => { resolveLogin = resolve }))
    const user = userEvent.setup()
    render(<LoginForm onLogin={onLogin} />)

    await user.type(screen.getByLabelText(/username/i), 'agent1')
    await user.type(screen.getByLabelText(/password/i), 'password')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled()
    resolveLogin!()
  })
})
