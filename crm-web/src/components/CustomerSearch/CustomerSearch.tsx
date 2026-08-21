import { useState } from 'react'
import { useCustomerSearch } from '../../hooks/useCustomerSearch'
import { CustomerList } from '../CustomerList/CustomerList'
import { LoadingState } from '../shared/LoadingState'
import { EmptyState } from '../shared/EmptyState'
import { ErrorState } from '../shared/ErrorState'

interface CustomerSearchProps {
    onSelectCustomer: (customerId:string) => void,
}

export function CustomerSearch({ onSelectCustomer }: CustomerSearchProps) {
  const [query, setQuery] = useState('')
  const { customers, status, error, retry } = useCustomerSearch(query)

  return (
    <form className="customer-search" onSubmit={e => e.preventDefault()}>
      <label className="customer-search__label" htmlFor="customer-search-input">
        Find Customer
      </label>
      <input
        id="customer-search-input"
        className="customer-search__input"
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search by name"
      />

      {status === 'loading' && <LoadingState message="Loading Customers..." />}

      {status === 'error' && error && (
        <ErrorState message={error.message} status={error.status} kind={error.kind} onRetry={retry} />
      )}

      {status === 'success' && customers.length === 0 && <EmptyState />}

      {status === 'success' && customers.length > 0 && (
        <CustomerList customers={customers} onSelectCustomer={onSelectCustomer} />
      )}
    </form>
  )
}