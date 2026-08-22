import type { Customer } from "../../types/customer"
import { CustomerCard } from "../objects/CustomerCard"

interface CustomerListProps {
    customers:Customer[],
    onSelectCustomer: (customerId:string) => void,
}

export function CustomerList({customers, onSelectCustomer}: CustomerListProps) {
    return (
        <ul className="customer-list">
            {customers.map((c) => (
                <li key = {c.customerId}>
                    <CustomerCard customer={c} onSelectCustomer={onSelectCustomer} />
                </li>
            ))}
        </ul>
    )
}