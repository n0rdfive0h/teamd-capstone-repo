import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { CustomerForm } from './CustomerForm'
import { ApiError } from '../../api/ApiError'

describe('CustomerForm', () => {
  it('disables submit when both fields are empty', () => {
    render(<CustomerForm onCreateCustomer={vi.fn()} />)
    expect(screen.getByRole('button', { name: /save customer/i })).toBeDisabled()
  })

  it('disables submit when name is filled but email has no @', () => {

    const user = userEvent.setup()

    render(<CustomerForm onCreateCustomer={vi.fn()} />)
    const nameInput = screen.getByLabelText(/full name/i)
    const emailInput = screen.getByLabelText(/email/i)

    user.type(nameInput, 'John Smith')
    user.type(emailInput, 'not-an-email')

    expect(screen.getByRole('button', { name: /save customer/i })).toBeDisabled()
  })

  it('disables submit when email is filled but name is empty', async () => {
    const user = userEvent.setup()
    render(<CustomerForm onCreateCustomer={vi.fn()} />)

    await user.type(screen.getByLabelText(/email/i), 'john@example.com')

    expect(screen.getByRole('button', { name: /save customer/i })).toBeDisabled()
  })

  it('enables submit once both a name and a valid-looking email are entered', async () => {
    const user = userEvent.setup()
    render(<CustomerForm onCreateCustomer={vi.fn()} />)

    await user.type(screen.getByLabelText(/full name/i), 'John Smith')
    await user.type(screen.getByLabelText(/email/i), 'john@example.com')

    expect(screen.getByRole('button', { name: /save customer/i })).toBeEnabled()
  })

  it('calls onCreateCustomer with trimmed name and email on submit', async () => {
    const onCreateCustomer = vi.fn().mockResolvedValue({})
    const user = userEvent.setup()
    render(<CustomerForm onCreateCustomer={onCreateCustomer} />)

    await user.type(screen.getByLabelText(/full name/i), '  John Smith  ')
    await user.type(screen.getByLabelText(/email/i), '  john@example.com  ')
    await user.click(screen.getByRole('button', { name: /save customer/i }))

    expect(onCreateCustomer).toHaveBeenCalledWith({
      fullName: 'John Smith',
      email: 'john@example.com',
    })
  })

  it('clears the fields after a successful submit', async () => {
    const onCreateCustomer = vi.fn().mockResolvedValue({})
    const user = userEvent.setup()
    render(<CustomerForm onCreateCustomer={onCreateCustomer} />)

    const nameInput = screen.getByLabelText(/full name/i)
    const emailInput = screen.getByLabelText(/email/i)

    await user.type(nameInput, 'John Smith')
    await user.type(emailInput, 'john@example.com')
    await user.click(screen.getByRole('button', { name: /save customer/i }))

    expect(nameInput).toHaveValue('')
    expect(emailInput).toHaveValue('')
  })

  it('shows an alert when onCreateCustomer rejects', async () => {
    const onCreateCustomer = vi.fn().mockRejectedValue(new ApiError('Email already in use', 'http', 400))
    const user = userEvent.setup()
    render(<CustomerForm onCreateCustomer={onCreateCustomer} />)

    await user.type(screen.getByLabelText(/full name/i), 'John Smith')
    await user.type(screen.getByLabelText(/email/i), 'john@example.com')
    await user.click(screen.getByRole('button', { name: /save customer/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Email already in use')
  })

  it('disables submit while a submission is in flight', async () => {
    let resolveCreate: () => void
    const onCreateCustomer = vi.fn(() => new Promise<void>(resolve => { resolveCreate = resolve }))
    const user = userEvent.setup()
    render(<CustomerForm onCreateCustomer={onCreateCustomer} />)

    await user.type(screen.getByLabelText(/full name/i), 'John Smith')
    await user.type(screen.getByLabelText(/email/i), 'john@example.com')
    await user.click(screen.getByRole('button', { name: /save customer/i }))

    expect(screen.getByRole('button', { name: /saving/i })).toBeDisabled()
    resolveCreate!()
  })

  it('does not call onCreateCustomer when fields are invalid', async () => {
    const onCreateCustomer = vi.fn()
    const user = userEvent.setup()
    render(<CustomerForm onCreateCustomer={onCreateCustomer} />)

    // button is disabled, but assert the handler itself is never invoked
    await user.click(screen.getByRole('button', { name: /save customer/i }))

    expect(onCreateCustomer).not.toHaveBeenCalled()
  })
})