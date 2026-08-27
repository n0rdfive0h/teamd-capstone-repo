import type { Customer } from "../../types/customer"
import { CustomerCard } from "../objects/CustomerCard"
import "./CustomerList.css"

interface CustomerListProps {
    customers: Customer[]
    onSelectCustomer: (customerId: string) => void
}

export function CustomerList({ customers, onSelectCustomer }: CustomerListProps) {
    return (
        <ul className="customer-list" aria-label="Customer list">
            {customers.map(c => (
                <li key={c.customerId}>
                    <CustomerCard customer={c} onSelectCustomer={onSelectCustomer} />
                </li>
            ))}
        </ul>
    )
}
