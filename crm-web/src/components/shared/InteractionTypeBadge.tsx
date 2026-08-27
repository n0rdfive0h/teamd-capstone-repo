import type { InteractionType } from '../../types/interaction'

const labels: Record<InteractionType, string> = {
  CALL: 'Call',
  EMAIL: 'Email',
  NOTE: 'Note',
  MEETING: 'Meeting',
}

export function InteractionTypeBadge({ intType }: { intType: InteractionType }) {
  return (
    <span
      className={`badge badge--neutral interaction-type--${intType.toLowerCase()}`}
      aria-label={`Interaction type: ${labels[intType]}`}
    >
      {labels[intType]}
    </span>
  )
}
