import { useMemo, useState } from 'react'
import { useCustomerSearch } from '../../hooks/useCustomerSearch'
import { useCreateCustomer } from '../../hooks/useCustomerCreate'
import { CustomerForm } from '../CustomerForm/CustomerForm'
import { CustomerList } from '../CustomerList/CustomerList'
import { StatCard } from './StatCard'
import { LoadingState } from '../shared/LoadingState'
import { ErrorState } from '../shared/ErrorState'
import { EmptyState } from '../shared/EmptyState'
import type { CustomerStatus } from '../../types/customer'
import './Dashboard.css'

const STATUS_ORDER: Record<CustomerStatus, number> = { ACTIVE: 0, PROSPECT: 1, CLOSED: 2 }

interface DashboardProps {
  onSelectCustomer: (customerId: string) => void
}

export function Dashboard({ onSelectCustomer }: DashboardProps) {
  const { customers, status, error, retry } = useCustomerSearch('')
  const { createCustomer } = useCreateCustomer()
  const [filter, setFilter] = useState('')
  const [showCreate, setShowCreate] = useState(false)

  const counts = useMemo(
    () => ({
      total: customers.length,
      active: customers.filter(c => c.status === 'ACTIVE').length,
      prospect: customers.filter(c => c.status === 'PROSPECT').length,
      closed: customers.filter(c => c.status === 'CLOSED').length,
    }),
    [customers],
  )

  const visible = useMemo(() => {
    const q = filter.trim().toLowerCase()
    return customers
      .filter(
        c =>
          !q ||
          c.fullName.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q),
      )
      .sort(
        (a, b) =>
          STATUS_ORDER[a.status] - STATUS_ORDER[b.status] ||
          a.fullName.localeCompare(b.fullName),
      )
  }, [customers, filter])

  async function handleCreate(draft: Parameters<typeof createCustomer>[0]) {
    const created = await createCustomer(draft)
    setShowCreate(false)
    retry()
    return created
  }

  const loading = status === 'idle' || status === 'loading'

  return (
    <section className="dashboard" aria-label="Dashboard">
      <div className="dashboard__head">
        <div>
          <h1>Dashboard</h1>
          <p className="dashboard__subtitle">Customer overview</p>
        </div>
        <button
          type="button"
          className="btn-secondary"
          onClick={() => setShowCreate(s => !s)}
          aria-expanded={showCreate}
          aria-controls="dashboard-create"
        >
          {showCreate ? 'Cancel' : 'Add customer'}
        </button>
      </div>

      {showCreate && (
        <div id="dashboard-create" className="dashboard__create card">
          <h2>New customer</h2>
          <CustomerForm onCreateCustomer={handleCreate} />
        </div>
      )}

      <div className="stat-grid">
        <StatCard tone="total" label="Total customers" value={counts.total} />
        <StatCard tone="active" label="Active" value={counts.active} />
        <StatCard tone="prospect" label="Prospects" value={counts.prospect} />
        <StatCard tone="closed" label="Closed" value={counts.closed} />
      </div>

      <div className="card customer-panel">
        <div className="customer-panel__head">
          <h2>Customers</h2>
          <input
            type="search"
            className="customer-panel__search"
            placeholder="Search by name or email…"
            aria-label="Search customers"
            value={filter}
            onChange={e => setFilter(e.target.value)}
          />
        </div>

        <div className="customer-panel__body">
          {loading && <LoadingState message="Loading customers…" />}
          {status === 'error' && error && (
            <ErrorState
              message={error.message}
              status={error.status}
              kind={error.kind}
              onRetry={retry}
            />
          )}
          {status === 'success' && visible.length === 0 && (
            <EmptyState
              message={filter ? 'No customers match your search.' : 'No customers yet.'}
            />
          )}
          {status === 'success' && visible.length > 0 && (
            <CustomerList customers={visible} onSelectCustomer={onSelectCustomer} />
          )}
        </div>
      </div>
    </section>
  )
}
