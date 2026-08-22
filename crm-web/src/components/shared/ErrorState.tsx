interface ErrorStateProps {
  message: string
  status?: number
  kind?: 'network' | 'http' | 'abort' | 'parse'
  onRetry?: () => void
}

export function ErrorState({ message, status, kind, onRetry }: ErrorStateProps) {
  const isUnauthorized = status === 401 || status === 403
  const isOutage = kind === 'network' || (status !== undefined && status >= 500)

  let displayMessage = message
  if (isUnauthorized) {
    displayMessage = "You're not authorized to view this. Please sign in and try again."
  } else if (isOutage) {
    displayMessage = "We can't reach the server right now. Check your connection and try again."
  }

  return (
    <div role="alert" className="error-state">
      <p>{displayMessage}</p>
      {onRetry && !isUnauthorized && (
        <button type="button" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  )
}