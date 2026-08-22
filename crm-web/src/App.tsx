import { useState } from 'react'
import { CustomerSearch } from './components/CustomerSearch/CustomerSearch'
import { CustomerProfile } from './components/CustomerProfile/CustomerProfile'

export default function App() {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null)

  return (
    <div className="app">
      <header>
        <h1>CRM</h1>
      </header>
      <main>
        {!selectedCustomerId &&<CustomerSearch onSelectCustomer={setSelectedCustomerId} />}
        {selectedCustomerId && <CustomerProfile customerId={selectedCustomerId} onClose={() => setSelectedCustomerId(null)} />}
      </main>
    </div>
  )
}