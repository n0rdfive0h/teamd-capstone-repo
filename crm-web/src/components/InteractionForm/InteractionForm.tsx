import { useRef, useState } from 'react'
import type { InteractionDraft, InteractionType } from '../../types/interaction'
import { ApiError } from '../../api/ApiError'
import './InteractionForm.css'

const SUMMARY_MAX_LENGTH = 1000

interface InteractionFormProps {
    customerId: string
    onCreate: (draft: InteractionDraft) => Promise<unknown>
}


export function InteractionForm({ customerId, onCreate }: InteractionFormProps) {
    const [interactionType, setInteractionType] = useState<InteractionType>('NOTE')
    const [summary, setSummary] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState<ApiError | null>(null)
    const [justSaved, setJustSaved] = useState(false)

    const summaryRef = useRef<HTMLTextAreaElement>(null)
    const successRef = useRef<HTMLParagraphElement>(null)

    const summaryTooLong = summary.length > SUMMARY_MAX_LENGTH
    const summaryEmpty = summary.trim().length === 0
    const canSubmit = !summaryTooLong && !summaryEmpty && !submitting

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!canSubmit) return

        setSubmitting(true)
        setSubmitError(null)
        setJustSaved(false)

        try {
            await onCreate({ customerId, interactionType, summary: summary.trim() })
            setSummary('')
            setInteractionType('NOTE')
            setJustSaved(true)
            successRef.current?.focus()
        } catch (err) {
            const apiError = err instanceof ApiError ? err : new ApiError('Unknown error', 'network')
            setSubmitError(apiError)
            summaryRef.current?.focus()
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className='interaction-form-container'>
            <form className="interaction-form" onSubmit={handleSubmit} aria-label="Add interaction">
                <label htmlFor="interaction-type">Type</label>
                <select
                    id="interaction-type"
                    value={interactionType}
                    onChange={e => setInteractionType(e.target.value as InteractionType)}
                >
                    <option value="NOTE">Note</option>
                    <option value="CALL">Call</option>
                    <option value="EMAIL">Email</option>
                    <option value="MEETING">Meeting</option>
                </select>

                <label htmlFor="interaction-summary">Interaction summary</label>
                <textarea
                    id="interaction-summary"
                    ref={summaryRef}
                    value={summary}
                    onChange={e => { setSummary(e.target.value); setJustSaved(false) }}
                    maxLength={SUMMARY_MAX_LENGTH + 50}
                    required
                    aria-describedby={submitError ? 'summary-help summary-error' : 'summary-help'}
                    aria-invalid={!!submitError || summaryTooLong}
                />
                <p id="summary-help">
                    {summary.length} / {SUMMARY_MAX_LENGTH} characters.<br></br> Do not enter payment details or passwords.
                </p>
                {submitError && (
                    <p id="summary-error" role="alert">{submitError.message}</p>
                )}

                <p ref={successRef} tabIndex={-1} className="sr-only" aria-live="polite">
                    {justSaved ? 'Interaction Saved' : ''}
                </p>

                <button type="submit" disabled={!canSubmit}>
                    {submitting ? 'Saving…' : 'Save interaction'}
                </button>
            </form>
        </div>
    )
}