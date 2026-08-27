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

  if (fetchStatus === 'loading' || fetchStatus === 'idle') {
    return <LoadingState message="Loading customer..." />
  }

  if (fetchStatus === 'error' && fetchError) {
    return (
      <ErrorState
        message={fetchError.message}
        status={fetchError.status}
        kind={fetchError.kind}
        onRetry={retry}
      />
    )
  }

  if (fetchStatus === 'success' && customer) {
    return (
      <div className="customer-profile">

        <div className='customer-info-wrapper'>

          <div className="customer-info-container">
            <header className="customer-profile__header">
              <h2>{customer.fullName}</h2>
              <StatusBadge status={customer.status} />
              <p className="customer-profile__email">{customer.email}</p>

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
                <p role="alert">{updateError.message}</p>
              )}
            </header>
          </div>

          <div className='return-button-container'>
            <button
              type="button"
              className="customer-profile__close"
              onClick={onClose}
              aria-label="Close customer profile, return to list"
            >
              Return to List
            </button>
          </div>

        </div> {/* end customer info and button */}

        <div className='interaction-wrapper'>

          <div className='interaction-timeline-container-profile'>
            <InteractionTimeline
              interactions={interactions}
              status={interactionsStatus}
              error={interactionsError}
              onRetry={retryInteractions}
            />
          </div>

          <div className='interaction-form-container-profile'>
            <InteractionForm customerId={customer.customerId} onCreate={createInteraction} />
          </div>

        </div>

        {/* end customer-profile-wrapper */}
      </div>
    )
  }

  return null
}