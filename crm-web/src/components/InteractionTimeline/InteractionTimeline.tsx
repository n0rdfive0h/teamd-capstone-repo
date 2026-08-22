import type { Interaction } from '../../types/interaction'
import type { ApiError } from '../../api/ApiError'
import { InteractionCard } from '../objects/InteractionCard'
import { LoadingState } from '../shared/LoadingState'
import { ErrorState } from '../shared/ErrorState'
import { EmptyState } from '../shared/EmptyState'

interface InteractionTimelineProps {
  interactions: Interaction[]
  status: 'idle' | 'loading' | 'error' | 'success'
  error: ApiError | null
  onRetry: () => void
}

export function InteractionTimeline({ interactions, status, error, onRetry }: InteractionTimelineProps) {
  if (status === 'loading' || status === 'idle') {
    return <LoadingState message="Loading interactions..." />
  }

  if (status === 'error' && error) {
    return <ErrorState message={error.message} status={error.status} kind={error.kind} onRetry={onRetry} />
    }

  if (status === 'success' && interactions.length === 0) {
    return <EmptyState message="No interactions yet." />
  }

  return (
    <section aria-label="Interaction timeline">
      <ul className="interaction-timeline">
        {interactions.map(interaction => (
          <InteractionCard key={interaction.interactionId} interaction={interaction} />
        ))}
      </ul>
    </section>
  )
}