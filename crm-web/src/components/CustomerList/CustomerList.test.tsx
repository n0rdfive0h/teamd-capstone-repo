import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { CustomerList } from './CustomerList'
import type { Customer } from '../../types/customer'

const customers: Customer[] = [
  { customerId: 'CUS-1001', fullName: 'Amina Khan', email: 'amina.khan@example.test', status: 'ACTIVE' },
  { customerId: 'CUS-1002', fullName: 'Ravi Singh', email: 'ravi.singh@example.test', status: 'PROSPECT' },
]

describe('CustomerList', () => {
  it('renders one button per customer', () => {
    render(<CustomerList customers={customers} onSelectCustomer={vi.fn()} />)
    expect(screen.getAllByRole('button')).toHaveLength(2)
  })

  it('shows each customer\'s name, email, and status', () => {
    render(<CustomerList customers={customers} onSelectCustomer={vi.fn()} />)
    expect(screen.getByText('Amina Khan')).toBeInTheDocument()
    expect(screen.getByText('amina.khan@example.test')).toBeInTheDocument()
    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('calls onSelectCustomer with the correct id when clicked', async () => {
    const onSelectCustomer = vi.fn()
    const user = userEvent.setup()
    render(<CustomerList customers={customers} onSelectCustomer={onSelectCustomer} />)

    await user.click(screen.getByRole('button', { name: /ravi singh/i }))

    expect(onSelectCustomer).toHaveBeenCalledWith('CUS-1002')
    expect(onSelectCustomer).toHaveBeenCalledTimes(1)
  })

  it('renders nothing when the list is empty', () => {
    render(<CustomerList customers={[]} onSelectCustomer={vi.fn()} />)
    expect(screen.queryAllByRole('button')).toHaveLength(0)
  })
})