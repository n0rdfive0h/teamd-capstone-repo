import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { InteractionTimeline } from './InteractionTimeline'
import { ApiError } from '../../api/ApiError'

const sampleInteraction = {
  interactionId: '22cbd873-4930-49ec-9c80-830fb7b45f6d',
  customerId: 'CUS-1001',
  interactionType: 'NOTE' as const,
  summary: 'Follow-up on billing question',
  correlationId: 'lab-request-001',
  createdAt: '2026-08-18T20:11:32.103582300Z',
}

describe('InteractionTimeline', () => {
  it('shows loading state', () => {
    render(<InteractionTimeline interactions={[]} status="loading" error={null} onRetry={vi.fn()} />)
    expect(screen.getByText(/loading interactions/i)).toBeInTheDocument()
  })

  it('shows empty state when there are no interactions', () => {
    render(<InteractionTimeline interactions={[]} status="success" error={null} onRetry={vi.fn()} />)
    expect(screen.getByText(/no interactions yet/i)).toBeInTheDocument()
  })

  it('renders interaction summaries when present', () => {
    render(<InteractionTimeline interactions={[sampleInteraction]} status="success" error={null} onRetry={vi.fn()} />)
    expect(screen.getByText('Follow-up on billing question')).toBeInTheDocument()
  })

  it('shows an outage message and retry button on network error', () => {
    const error = new ApiError('A network error occurred.', 'network')
    render(<InteractionTimeline interactions={[]} status="error" error={error} onRetry={vi.fn()} />)
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument()
  })

  it('does not show a retry button for a 401', () => {
    const error = new ApiError('Unauthorized', 'http', 401)
    render(<InteractionTimeline interactions={[]} status="error" error={error} onRetry={vi.fn()} />)
    expect(screen.queryByRole('button', { name: /retry/i })).not.toBeInTheDocument()
  })
})