import type {Customer } from '../../types/customer'
import { StatusBadge } from '../shared/StatusBadge'

interface CustomerProps {
    customer:Customer
    onSelectCustomer: (customerId:string) => void
}

export function CustomerCard({customer, onSelectCustomer}: CustomerProps) {
    return (
        <article className="customer-card" data-testid={`card-${customer.customerId}`}>
            <p>{customer.fullName}</p>
            <p>{customer.email}</p>
            <StatusBadge status={customer.status}/>
            <button onClick={() => onSelectCustomer(customer.customerId)}>Click for {customer.fullName}'s interactions</button>
        </article>
    )
}
