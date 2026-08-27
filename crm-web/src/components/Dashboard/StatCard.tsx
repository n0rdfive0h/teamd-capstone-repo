import './StatCard.css'

export type StatTone = 'total' | 'active' | 'prospect' | 'closed'

interface StatCardProps {
  tone: StatTone
  label: string
  value: number
}

export function StatCard({ tone, label, value }: StatCardProps) {
  return (
    <div className={`stat-card stat-card--${tone}`} data-testid={`stat-${tone}`}>
      <span className="stat-card__value">{value}</span>
      <span className="stat-card__label">{label}</span>
    </div>
  )
}
