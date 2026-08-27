import { useCustomerProfile } from '../../hooks/useCustomerProfile'
import { useInteractions } from '../../hooks/useInteractions'
import { InteractionTimeline } from '../InteractionTimeline/InteractionTimeline'
import { InteractionForm } from '../InteractionForm/InteractionForm'
import { LoadingState } from '../shared/LoadingState'
import { ErrorState } from '../shared/ErrorState'
import { StatusBadge } from '../shared/StatusBadge'
import type { CustomerStatus } from '../../types/customer'
import './CustomerProfile.css'

interface CustomerProfileProps {
  customerId: string
  onClose: () => void
}

export function CustomerProfile({ customerId, onClose }: CustomerProfileProps) {
  const {
    customer,
    fetchStatus,
    fetchError,
    retry,
    changeStatus,
    updateStatus,
    updateError,
  } = useCustomerProfile(customerId)

  const {
    interactions,
    status: interactionsStatus,
    error: interactionsError,
    retry: retryInteractions,
    createInteraction,
  } = useInteractions(customerId)

  const backButton = (
    <button
      type="button"
      className="btn-ghost customer-profile__back"
      onClick={onClose}
      aria-label="Close customer profile, return to list"
    >
      ‹ Return to List
    </button>
  )

  if (fetchStatus === 'loading' || fetchStatus === 'idle') {
    return (
      <div className="customer-profile">
        {backButton}
        <LoadingState message="Loading customer..." />
      </div>
    )
  }

  if (fetchStatus === 'error' && fetchError) {
    return (
      <div className="customer-profile">
        {backButton}
        <ErrorState
          message={fetchError.message}
          status={fetchError.status}
          kind={fetchError.kind}
          onRetry={retry}
        />
      </div>
    )
  }

  if (fetchStatus === 'success' && customer) {
    return (
      <div className="customer-profile">
        {backButton}

        <header className="customer-profile__header card">
          <div className="customer-profile__identity">
            <h2>{customer.fullName}</h2>
            <StatusBadge status={customer.status} />
          </div>
          <p className="customer-profile__email">{customer.email}</p>

          <div className="customer-profile__status-field">
            <label htmlFor="customer-status-select">Status</label>
            <select
              id="customer-status-select"
              aria-label="Customer status"
              value={customer.status}
              disabled={updateStatus === 'submitting'}
              onChange={e => changeStatus(e.target.value as CustomerStatus)}
            >
              <option value="PROSPECT">Prospect</option>
              <option value="ACTIVE">Active</option>
              <option value="CLOSED">Closed</option>
            </select>
            {updateStatus === 'error' && updateError && (
              <p role="alert" className="customer-profile__error">{updateError.message}</p>
            )}
          </div>
        </header>

        <div className="customer-profile__body">
          <section className="customer-profile__panel card" aria-label="Interaction history">
            <h3>Interaction history</h3>
            <InteractionTimeline
              interactions={interactions}
              status={interactionsStatus}
              error={interactionsError}
              onRetry={retryInteractions}
            />
          </section>

          <section className="customer-profile__panel card" aria-label="Log an interaction">
            <h3>Log an interaction</h3>
            <InteractionForm customerId={customer.customerId} onCreate={createInteraction} />
          </section>
        </div>
      </div>
    )
  }

  return null
}
