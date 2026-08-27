import { useState, useCallback } from 'react'
import { CustomerApiClient } from '../api/customersApi'
import { ApiError } from '../api/ApiError'
import type { CustomerDraft, Customer } from '../types/customer'

export function useCreateCustomer() {
    const [status, setStatus] = useState<'idle' | 'error' | 'submitting'>('idle')
    const[error, setError] = useState<ApiError | null>(null)

    const createCustomer = useCallback( async (draft: CustomerDraft): Promise<Customer> => {
        // set hook status
        setStatus('submitting')

        // set signal
        const controller = new AbortController()

        // try post
        try {
            const response = await CustomerApiClient.create(draft, controller.signal)

            setStatus('idle')
            return response
        }
        catch (e) {
            const apiError = e instanceof ApiError ? e : new ApiError('Unknown error', 'network')

            setError(apiError)
            setStatus('error')
            throw apiError
        }
    }, [])

    return { createCustomer, status, error }
}