import type { Customer } from '../../types/customer'
import { StatusBadge } from '../shared/StatusBadge'
import './CustomerCard.css'

interface CustomerProps {
    customer: Customer
    onSelectCustomer: (customerId: string) => void
}

function initialsOf(name: string): string {
    return name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map(part => part[0]?.toUpperCase() ?? '')
        .join('')
}

export function CustomerCard({ customer, onSelectCustomer }: CustomerProps) {
    return (
        <button
            type="button"
            className="customer-row"
            data-testid={`card-${customer.customerId}`}
            onClick={() => onSelectCustomer(customer.customerId)}
        >
            <span className="customer-row__avatar" aria-hidden="true">
                {initialsOf(customer.fullName)}
            </span>
            <span className="customer-row__identity">
                <span className="customer-row__name">{customer.fullName}</span>
                <span className="customer-row__email">{customer.email}</span>
            </span>
            <StatusBadge status={customer.status} />
            <svg
                className="customer-row__chevron"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
            >
                <polyline points="9 18 15 12 9 6" />
            </svg>
        </button>
    )
}
