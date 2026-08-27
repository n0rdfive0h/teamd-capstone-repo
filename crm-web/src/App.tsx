import { useState } from 'react'
import { CustomerSearch } from './components/CustomerSearch/CustomerSearch'
import { CustomerProfile } from './components/CustomerProfile/CustomerProfile'
import { CustomerForm } from './components/CustomerForm/CustomerForm'
import { useCreateCustomer } from './hooks/useCustomerCreate'

export default function App() {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null)
  const [listRefreshKey, setListRefreshKey] = useState(0)
  const [showCreateForm, setShowCreateForm] = useState(false)

  const { createCustomer } = useCreateCustomer()

  function handleClose() {
    setSelectedCustomerId(null)
    setListRefreshKey(k => k + 1)
  }

  async function handleCreateCustomer(draft: Parameters<typeof createCustomer>[0]) {
    const created = await createCustomer(draft)
    setShowCreateForm(false)
    setListRefreshKey(k => k + 1)
    return created
  }

  return (
    <div className="app">
      <header>
        <h1>Customer Relations Management</h1>
      </header>
      <main>
        {!selectedCustomerId && (
          <>
            <button
              type="button"
              onClick={() => setShowCreateForm(show => !show)}
              aria-expanded={showCreateForm}
              aria-controls="create-customer-form"
            >
              {showCreateForm ? 'Cancel' : 'Add New Customer'}
            </button>

            {showCreateForm && (
              <div id="create-customer-form">
                <CustomerForm onCreateCustomer={handleCreateCustomer} />
              </div>
            )}

            <CustomerSearch key={listRefreshKey} onSelectCustomer={setSelectedCustomerId} />
          </>
        )}

        {selectedCustomerId && (
          <CustomerProfile customerId={selectedCustomerId} onClose={handleClose} />
        )}
      </main>
    </div>
  )
}