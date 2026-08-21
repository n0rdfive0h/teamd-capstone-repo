import type {InteractionType} from '../../types/interaction'


const labels: Record<InteractionType, string> = {
  CALL: 'Call',
  EMAIL: 'Email',
  NOTE: 'Note',
  MEETING: 'Meeting',
}

export function InteractionTypeBadge({ intType }: { intType: InteractionType }) {
  // TODO: render accessible status text (role or aria-label); style by status

  return <p className={`interaction-type----${intType.toLowerCase()}`}
                role="status"
                aria-label={`Interaction type: ${labels[intType]}`}>
      {labels[intType]}
    </p>
}