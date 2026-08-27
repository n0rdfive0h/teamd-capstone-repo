import type { Customer } from "../../types/customer"
import { CustomerCard } from "../objects/CustomerCard"
import "./CustomerList.css";

interface CustomerListProps {
    customers:Customer[],
    onSelectCustomer: (customerId:string) => void,
}

export function CustomerList({customers, onSelectCustomer}: CustomerListProps) {
    return (
        <div className="customer-list-wrapper">
            <div className="customer-list-container">
                <section aria-label="Customer List">
                    <ul className="customer-list">
                        {customers.map((c) => (
                            <li key = {c.customerId}>
                                <CustomerCard customer={c} onSelectCustomer={onSelectCustomer} />
                            </li>
                        ))}
                    </ul>
                </section>
            </div>
        </div>
    )
}