import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CustomerSearch } from './CustomerSearch'
import { CustomerApiClient } from '../../api/customersApi'

vi.mock('../../api/customersApi')

const mockCustomers = [
  { customerId: 'CUS-1001', fullName: 'Amina Khan', email: 'amina.khan@example.test', status: 'ACTIVE' as const },
  { customerId: 'CUS-1002', fullName: 'Ravi Singh', email: 'ravi.singh@example.test', status: 'PROSPECT' as const },
]

describe('CustomerSearch', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('shows customers returned from search', async () => {
    vi.mocked(CustomerApiClient.search).mockResolvedValue(mockCustomers)

    render(<CustomerSearch onSelectCustomer={vi.fn()} />)

    expect(await screen.findByText('Amina Khan')).toBeInTheDocument()
    expect(screen.getByText('Ravi Singh')).toBeInTheDocument()
  })

  it('shows an empty state when search returns nothing', async () => {
    vi.mocked(CustomerApiClient.search).mockResolvedValue([])

    render(<CustomerSearch onSelectCustomer={vi.fn()} />)

    expect(await screen.findByText(/no customers/i)).toBeInTheDocument()
  })

  it('calls onSelectCustomer with the right id when a result is clicked', async () => {
    vi.mocked(CustomerApiClient.search).mockResolvedValue(mockCustomers)
    const onSelectCustomer = vi.fn()
    const user = userEvent.setup()

    render(<CustomerSearch onSelectCustomer={onSelectCustomer} />)

    const aminaButton = await screen.findByRole('button', { name: /amina khan/i })
    await user.click(aminaButton)

    expect(onSelectCustomer).toHaveBeenCalledWith('CUS-1001')
  })

  it('re-searches when the query changes', async () => {
    vi.mocked(CustomerApiClient.search).mockResolvedValue(mockCustomers)
    const user = userEvent.setup()

    render(<CustomerSearch onSelectCustomer={vi.fn()} />)
    await screen.findByText('Amina Khan')

    await user.type(screen.getByLabelText(/find customer/i), 'Amina')

    await waitFor(() => {
      expect(CustomerApiClient.search).toHaveBeenCalledWith('Amina', expect.anything())
    })
  })
})