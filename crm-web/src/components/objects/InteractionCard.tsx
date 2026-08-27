import type { Interaction} from '../../types/interaction'
import { InteractionTypeBadge } from '../shared/InteractionTypeBadge'
import './InteractionCard.css'


interface InteractionCardProps {
    interaction: Interaction
}

export function InteractionCard({ interaction }: InteractionCardProps) {
  const formattedDate = new Date(interaction.createdAt).toLocaleString()

  return (
    <article className="interaction-card" data-testid={`card-${interaction.interactionId}`}>
      <InteractionTypeBadge intType={interaction.interactionType} />
      <p>{interaction.summary}</p>
      <time dateTime={interaction.createdAt}>{formattedDate}</time>
    </article>
  )
}