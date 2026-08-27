import { useState } from 'react'
import { CustomerProfile } from './components/CustomerProfile/CustomerProfile'
import { Dashboard } from './components/Dashboard/Dashboard'
import { LoginForm } from './components/LoginForm/LoginForm'
import { useAuth } from './hooks/useAuth'
import './App.css'

function Brand({ size = 'md' }: { size?: 'md' | 'lg' }) {
  return (
    <span className={`brand brand--${size}`}>
      <span className="brand__mark" aria-hidden="true">★</span>
      <span className="brand__text">
        Northstar <span className="brand__crm">CRM</span>
      </span>
    </span>
  )
}

export default function App() {
  const { isAuthenticated, username, login, logout } = useAuth()
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null)

  function handleSignOut() {
    setSelectedCustomerId(null)
    logout()
  }

  if (!isAuthenticated) {
    return (
      <div className="login-screen">
        <div className="login-screen__panel">
          <Brand size="lg" />
          <p className="login-screen__tagline">Sign in to your workspace</p>
          <LoginForm onLogin={login} />
        </div>
      </div>
    )
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar__inner">
          <Brand />
          <div className="topbar__session">
            <span className="topbar__user">
              Signed in as <strong>{username}</strong>
            </span>
            <button type="button" className="btn-ghost" onClick={handleSignOut}>
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="app-main">
        {selectedCustomerId ? (
          <CustomerProfile
            customerId={selectedCustomerId}
            onClose={() => setSelectedCustomerId(null)}
          />
        ) : (
          <Dashboard onSelectCustomer={setSelectedCustomerId} />
        )}
      </main>
    </div>
  )
}
