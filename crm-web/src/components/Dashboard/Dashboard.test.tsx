import { render, screen, within, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Dashboard } from './Dashboard'
import { CustomerApiClient } from '../../api/customersApi'
import type { Customer } from '../../types/customer'

vi.mock('../../api/customersApi')

const customers: Customer[] = [
  { customerId: 'CUS-3', fullName: 'Cara Closed', email: 'cara@example.test', status: 'CLOSED' },
  { customerId: 'CUS-1', fullName: 'Alan Active', email: 'alan@example.test', status: 'ACTIVE' },
  { customerId: 'CUS-2', fullName: 'Priya Prospect', email: 'priya@example.test', status: 'PROSPECT' },
  { customerId: 'CUS-4', fullName: 'Aisha Active', email: 'aisha@example.test', status: 'ACTIVE' },
]

describe('Dashboard', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.mocked(CustomerApiClient.search).mockResolvedValue(customers)
  })

  it('shows a count per status in the stat cards', async () => {
    render(<Dashboard onSelectCustomer={vi.fn()} />)

    await screen.findByRole('list', { name: /customer list/i })

    expect(within(screen.getByTestId('stat-total')).getByText('4')).toBeInTheDocument()
    expect(within(screen.getByTestId('stat-active')).getByText('2')).toBeInTheDocument()
    expect(within(screen.getByTestId('stat-prospect')).getByText('1')).toBeInTheDocument()
    expect(within(screen.getByTestId('stat-closed')).getByText('1')).toBeInTheDocument()
  })

  it('lists customers sorted active -> prospect -> closed', async () => {
    render(<Dashboard onSelectCustomer={vi.fn()} />)

    const list = await screen.findByRole('list', { name: /customer list/i })
    const rows = within(list).getAllByRole('button')

    expect(rows).toHaveLength(4)
    expect(rows[0]).toHaveTextContent('Aisha Active')
    expect(rows[1]).toHaveTextContent('Alan Active')
    expect(rows[2]).toHaveTextContent('Priya Prospect')
    expect(rows[3]).toHaveTextContent('Cara Closed')
  })

  it('filters the list by the search box', async () => {
    const user = userEvent.setup()
    render(<Dashboard onSelectCustomer={vi.fn()} />)
    await screen.findByRole('list', { name: /customer list/i })

    await user.type(screen.getByLabelText(/search customers/i), 'priya')

    const list = screen.getByRole('list', { name: /customer list/i })
    expect(within(list).getAllByRole('button')).toHaveLength(1)
    expect(within(list).getByText('Priya Prospect')).toBeInTheDocument()
  })

  it('calls onSelectCustomer when a row is clicked', async () => {
    const onSelectCustomer = vi.fn()
    const user = userEvent.setup()
    render(<Dashboard onSelectCustomer={onSelectCustomer} />)
    await screen.findByRole('list', { name: /customer list/i })

    await user.click(screen.getByRole('button', { name: /alan active/i }))

    expect(onSelectCustomer).toHaveBeenCalledWith('CUS-1')
  })

  it('shows an empty state when no customers match the search', async () => {
    const user = userEvent.setup()
    render(<Dashboard onSelectCustomer={vi.fn()} />)
    await screen.findByRole('list', { name: /customer list/i })

    await user.type(screen.getByLabelText(/search customers/i), 'zzz-nobody')

    expect(await screen.findByText(/no customers match/i)).toBeInTheDocument()
  })

  it('reveals the new-customer form when "Add customer" is toggled', async () => {
    const user = userEvent.setup()
    render(<Dashboard onSelectCustomer={vi.fn()} />)
    await screen.findByRole('list', { name: /customer list/i })

    await user.click(screen.getByRole('button', { name: /add customer/i }))

    expect(screen.getByRole('form', { name: /add customer/i })).toBeInTheDocument()
  })

  it('shows an error state with retry when the fetch fails', async () => {
    vi.mocked(CustomerApiClient.search).mockRejectedValue(new Error('boom'))
    render(<Dashboard onSelectCustomer={vi.fn()} />)

    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument())
  })
})
