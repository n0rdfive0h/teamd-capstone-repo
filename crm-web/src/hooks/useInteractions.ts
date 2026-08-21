import { useCallback, useState, useEffect } from "react"
import type { Interaction, InteractionDraft } from "../types/interaction"
import { ApiError } from "../api/ApiError"
import { InteractionApiClient } from "../api/interactionsApi"


type Status = 'idle' | 'loading' | 'error' | 'success'

export function useInteractions(customerId:string | null) {
    const [interactions, setInteractions] = useState<Interaction[]>([])
    const [status, setStatus] = useState<Status>('idle')
    const [error, setError] = useState<ApiError | null>(null)
    const [refetchIndex, setRefetchIndex] = useState(0)

    useEffect( () => { // start useEffect
        if (!customerId) {
            return
        }

        const controller = new AbortController()
        // eslint-disable-next-line react-hooks/set-state-in-effect -- loading state needs to be set synchronously before the fetch starts
        setStatus('loading')
        setError(null)

        InteractionApiClient.get(customerId,controller.signal)
            .then(data => {
                setInteractions(data)
                setStatus('success')
            })
            .catch(error => {
                setInteractions([])
                setError(error instanceof ApiError ? error : new ApiError('Unknown Error', 'network'))
                setStatus('error')
            })

        return () => controller.abort()
    }, [customerId, refetchIndex])// end useEffect

    const retry = useCallback(() => setRefetchIndex(i => i + 1), [])

    const createInteraction = useCallback(async (draft: InteractionDraft) => {
        const created = await InteractionApiClient.create(draft)
        setInteractions(prev => [...prev, created])
        return created
    }, [])

    return { interactions, status, error, retry, createInteraction }
}// end useInteractions