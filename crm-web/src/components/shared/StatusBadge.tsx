import type { CustomerStatus } from '../../types/customer'

const labels: Record<CustomerStatus, string> = {
  PROSPECT: 'Prospect',
  ACTIVE: 'Active',
  CLOSED: 'Closed',
}

export function StatusBadge({ status }: { status: CustomerStatus }) {
  return (
    <span className={`badge badge--${status.toLowerCase()}`}>
      {labels[status]}
    </span>
  )
}
