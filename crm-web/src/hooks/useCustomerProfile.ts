import { useState, useEffect, useCallback } from 'react'
import { CustomerApiClient } from '../api/customersApi'
import { ApiError } from '../api/ApiError'
import type { Customer, CustomerStatus } from '../types/customer'

type FetchStatus = 'idle' | 'loading' | 'error' | 'success'
type UpdateStatus = 'idle' | 'submitting' | 'error'

export function useCustomerProfile(customerId:string | null) {
    const[customer, setCustomer] = useState<Customer | null>(null)
    const[fetchStatus, setFetchStatus] = useState<FetchStatus>('idle')
    const[fetchError, setFetchError] = useState<ApiError | null>(null)
    const[refetchxIndex, setRefetchIndex] = useState(0)

    // For update status portion of hook
    const[updateStatus, setUpdateStatus] = useState<UpdateStatus>('idle')
    const[updateError, setUpdateError] = useState<ApiError | null>(null)

    useEffect( () => {// start use effect
        if (!customerId) {
            return
        }

        const controller = new AbortController()
        // eslint-disable-next-line react-hooks/set-state-in-effect -- loading state needs to be set synchronously before the fetch starts
        setFetchStatus('loading')
        setFetchError(null)

        CustomerApiClient.getProfile(customerId, controller.signal)
            .then(data => {
                setCustomer(data)
                setFetchStatus('success')
            })
            .catch(error => {
                // return if aborted
                if (error instanceof ApiError && error.kind === 'abort'){
                    return
                }
                // wrap in ApiError if regular error
                setFetchError(error instanceof ApiError ? error : new ApiError('Unknown Error', 'network'))
                setFetchStatus('error')
            })


        return () => controller.abort()

    }, [customerId, refetchxIndex] ) // end useEffect

    const retry = useCallback(() => setRefetchIndex(i => i+ 1), [])

    const changeStatus = useCallback( async (newStatus: CustomerStatus) => {
        if (!customer) return
        setUpdateStatus('submitting')
        setUpdateError(null)

        try {// begin try
            const updated = await CustomerApiClient.updateStatus(customer.customerId, newStatus)
            setCustomer(updated)
            setUpdateStatus('idle')
        }
        catch (error) {
            const apiError = error instanceof ApiError ? error : new ApiError('Unknown Error', 'network')
            setUpdateError(apiError)
            setUpdateStatus('error')
            throw apiError
        }

    }, [customer])

    return { customer, fetchStatus, fetchError, updateStatus, updateError, changeStatus, retry}
}