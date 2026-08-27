import {useRef, useState} from 'react'
import type { CustomerDraft } from '../../types/customer'
import { ApiError } from '../../api/ApiError'

interface CustomerFormProps {
    onCreateCustomer: (draft: CustomerDraft) => Promise<unknown>
}

export function CustomerForm ({onCreateCustomer} : CustomerFormProps) {
    // form states
    const[customerName, setCustomerName] = useState<string>('')
    const[customerEmail, setCustomerEmail] = useState<string>('')
    
    // flow states
    const[submitting, setSubmitting] = useState(false)
    const[submitError, setSubmitError] = useState<ApiError | null>(null)
    const[justSaved, setJustSaved] = useState(false)

    // refs for accessibility
    const nameRef = useRef<HTMLInputElement>(null)
    const successRef = useRef<HTMLParagraphElement>(null)

    // constraints
    const nameEmpty = customerName.trim().length === 0
    const emailValid = customerEmail.trim().length > 0 && customerEmail.includes('@')
    const canSubmit = !nameEmpty && emailValid && !submitting

    async function handleSubmit (e:React.FormEvent) {

        e.preventDefault()

        // dont submit if not valid
        if (!canSubmit) {
            return
        }

        setSubmitting(true)
        setSubmitError(null)
        setJustSaved(false)

        // try catch submit
        try {
            await onCreateCustomer({ fullName: customerName.trim(), email: customerEmail.trim() })
            setCustomerName('')
            setCustomerEmail('')
            setJustSaved(true)
        }
        catch (error) {
            const apiError = error instanceof ApiError ? error : new ApiError('Unknown Erorr', 'network')
            setSubmitError(apiError)
        }
        finally {
            setSubmitting(false)
        }
    }


    return (
        <form className="customer-form" onSubmit={handleSubmit} aria-label='Add Customer'>

            <label htmlFor='customer-fullname-form-input'>Full Name</label>
            <input 
            id='customer-fullname-form-input'
            className='customer-fullName-form__input'
            ref={nameRef}
            type='text'
            value={customerName}
            onChange={e => {setCustomerName(e.target.value); setJustSaved(false)} }
            aria-describedby={submitError ? 'customer-form-error': undefined}
            placeholder='Input Customer Name'
            />

            <label htmlFor='customer-email-form-input'>Email</label>
            <input
            id='customer-email-form-input'
            className='customer-email-form__input'
            type='email'
            value={customerEmail}
            onChange={e => {setCustomerEmail(e.target.value); setJustSaved(false)} }
            aria-describedby={submitError ? 'customer-form-error' : undefined}
            placeholder="Input Customer Email"
            />

            {submitError && (
                <p id="customer-form-error" role="alert">{submitError.message}</p>
            )}

            <p ref={successRef} tabIndex={-1} className="sr-only" aria-live="polite">
                {justSaved ? 'Customer Saved' : ''}
            </p>

            <button type="submit" disabled={!canSubmit}>
                {submitting ? 'Saving…' : 'Save customer'}
            </button>

        </form>

    )
}