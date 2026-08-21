import type { CustomerStatus } from '../../types/customer'

const labels: Record<CustomerStatus, string> = {
  PROSPECT: "Prospect",
  ACTIVE: "Active",
  CLOSED: "Closed"
}

const colors: Record<CustomerStatus, string> = {
  PROSPECT: "orange",
  ACTIVE: "green",
  CLOSED: "red"
}

export function StatusBadge({ status }: { status: CustomerStatus }) {
  // TODO: render accessible status text (role or aria-label); style by status

  return <p className={`status status---${status.toLowerCase()}`} style={{color: colors[status]}}>
      {labels[status]}
    </p>
}