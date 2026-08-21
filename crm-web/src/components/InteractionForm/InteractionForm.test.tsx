import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { InteractionForm } from './InteractionForm'

describe('InteractionForm', () => {
  it('disables submit when summary is empty', () => {
    render(<InteractionForm customerId="CUS-1001" onCreate={vi.fn()} />)
    expect(screen.getByRole('button', { name: /save interaction/i })).toBeDisabled()
  })

  it('enables submit once a valid summary is entered', async () => {
    const user = userEvent.setup()
    render(<InteractionForm customerId="CUS-1001" onCreate={vi.fn()} />)
    await user.type(screen.getByLabelText(/interaction summary/i), 'Follow-up call')
    expect(screen.getByRole('button', { name: /save interaction/i })).toBeEnabled()
  })

  it('calls onCreate with the right draft on submit', async () => {
    const onCreate = vi.fn().mockResolvedValue({})
    const user = userEvent.setup()
    render(<InteractionForm customerId="CUS-1001" onCreate={onCreate} />)
    await user.type(screen.getByLabelText(/interaction summary/i), 'Billing question resolved')
    await user.click(screen.getByRole('button', { name: /save interaction/i }))
    expect(onCreate).toHaveBeenCalledWith({
      customerId: 'CUS-1001',
      interactionType: 'NOTE',
      summary: 'Billing question resolved',
    })
  })

  it('shows an alert when onCreate rejects', async () => {
    const onCreate = vi.fn().mockRejectedValue(new Error('Request failed with status 400'))
    const user = userEvent.setup()
    render(<InteractionForm customerId="CUS-1001" onCreate={onCreate} />)
    await user.type(screen.getByLabelText(/interaction summary/i), 'x'.repeat(5))
    await user.click(screen.getByRole('button', { name: /save interaction/i }))
    expect(await screen.findByRole('alert')).toBeInTheDocument()
  })

  it('disables submit while a submission is in flight', async () => {
    let resolveCreate: () => void
    const onCreate = vi.fn(() => new Promise<void>(resolve => { resolveCreate = resolve }))
    const user = userEvent.setup()
    render(<InteractionForm customerId="CUS-1001" onCreate={onCreate} />)
    await user.type(screen.getByLabelText(/interaction summary/i), 'Test note')
    await user.click(screen.getByRole('button', { name: /save interaction/i }))
    expect(screen.getByRole('button', { name: /saving/i })).toBeDisabled()
    resolveCreate!()
  })
})