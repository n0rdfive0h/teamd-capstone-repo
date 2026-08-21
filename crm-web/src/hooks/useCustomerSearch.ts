import { useState, useEffect, useCallback } from 'react'
import { CustomerApiClient } from '../api/customersApi'
import { ApiError } from '../api/ApiError'
import type { Customer } from '../types/customer'

type Status = 'idle' | 'loading' | 'error' | 'success'

export function useCustomerSearch(query:string) {
    const[customers, setCustomers] = useState<Customer[]>([])
    const[status, setStatus] = useState<Status>('idle')
    const[error, setError] = useState<ApiError | null>(null)
    const[refetchxIndex, setRefetchIndex] = useState(0)

    useEffect( () => {// start use effect
        // get controller and set to loading
        const controller = new AbortController()
        // eslint-disable-next-line react-hooks/set-state-in-effect -- loading state needs to be set synchronously before the fetch starts
        setStatus('loading')
        setError(null)

        // get and process customers
        CustomerApiClient.search(query, controller.signal)
            .then(data => { // successful query
                setCustomers(data)
                setStatus('success')
            })
            .catch( error => {
                if (error instanceof ApiError && error.kind === 'abort') {
                    return
                }
                setError(error instanceof ApiError ? error : new ApiError('Unknown Error', 'network'))
                setStatus('error')
            })

        return () => controller.abort()

    }, [query, refetchxIndex] ) // end useEffect

    const retry = useCallback(() => setRefetchIndex(i => i+ 1), [])


    return { customers, status, error, retry}
}