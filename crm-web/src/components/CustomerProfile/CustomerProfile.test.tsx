import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CustomerProfile } from './CustomerProfile'
import { CustomerApiClient } from '../../api/customersApi'
import { InteractionApiClient } from '../../api/interactionsApi'

vi.mock('../../api/customersApi')
vi.mock('../../api/interactionsApi')

const mockCustomer = {
  customerId: 'CUS-1001',
  fullName: 'Amina Khan',
  email: 'amina.khan@example.test',
  status: 'ACTIVE' as const,
}

describe('CustomerProfile', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('shows the customer header once loaded', async () => {
    vi.mocked(CustomerApiClient.getProfile).mockResolvedValue(mockCustomer)
    vi.mocked(InteractionApiClient.get).mockResolvedValue([])

    render(<CustomerProfile customerId="CUS-1001" onClose={vi.fn()} />)

    expect(await screen.findByRole('heading', { name: /amina khan/i })).toBeInTheDocument()
    expect(screen.getByText('amina.khan@example.test')).toBeInTheDocument()
  })

  it('calls onClose when the back button is clicked', async () => {
    vi.mocked(CustomerApiClient.getProfile).mockResolvedValue(mockCustomer)
    vi.mocked(InteractionApiClient.get).mockResolvedValue([])
    const onClose = vi.fn()
    const user = userEvent.setup()

    render(<CustomerProfile customerId="CUS-1001" onClose={onClose} />)
    await screen.findByRole('heading', { name: /amina khan/i })

    await user.click(screen.getByRole('button', { name: /Return to List/i }))

    expect(onClose).toHaveBeenCalled()
  })

  it('shows an error state if the profile fetch fails', async () => {
    vi.mocked(CustomerApiClient.getProfile).mockRejectedValue(new Error('Network error'))
    vi.mocked(InteractionApiClient.get).mockResolvedValue([])

    render(<CustomerProfile customerId="CUS-1001" onClose={vi.fn()} />)

    expect(await screen.findByRole('alert')).toBeInTheDocument()
  })

  it('updates status when a new value is selected in the dropdown', async () => {
    vi.mocked(CustomerApiClient.getProfile).mockResolvedValue(mockCustomer)
    vi.mocked(InteractionApiClient.get).mockResolvedValue([])
    vi.mocked(CustomerApiClient.updateStatus).mockResolvedValue({ ...mockCustomer, status: 'CLOSED' })
    const user = userEvent.setup()

    render(<CustomerProfile customerId="CUS-1001" onClose={vi.fn()} />)
    await screen.findByRole('heading', { name: /amina khan/i })

    await user.selectOptions(screen.getByLabelText(/customer status/i), 'CLOSED')

    expect(CustomerApiClient.updateStatus).toHaveBeenCalledWith('CUS-1001', 'CLOSED')
  })
})