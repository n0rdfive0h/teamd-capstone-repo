import { http } from './http'
import type { Interaction, InteractionDraft, InteractionType } from '../types/interaction'


interface InteractionApiResponse {
    id: string,
    customerId: string,
    interactionType:InteractionType,
    summary:string,
    correlationId?:string
    createdAt:string,
}

function mapToInteractions(res:InteractionApiResponse) : Interaction {
    return {
        interactionId: res.id,
        customerId: res.customerId,
        interactionType: res.interactionType,
        summary: res.summary,
        correlationId: res.correlationId,
        createdAt: res.createdAt
    }
}

export const InteractionApiClient = {
    create: async (draft:InteractionDraft, signal?:AbortSignal): Promise<Interaction> => {
        const response = await http<InteractionApiResponse>(
            '/api/v1/interactions',{
                method: 'POST',
                body: JSON.stringify(draft),
                headers: {'X-Correlation-Id': 'lab-request-001',}
            }, signal
        )
        return mapToInteractions(response)
    },

    get: async (customerId:string, signal?:AbortSignal): Promise<Interaction[]> => {
        const response = await http<InteractionApiResponse[]>(
            `/api/v1/customers/${customerId}/interactions`,
            {method: 'GET',},
            signal
        )
        if (response === undefined ){
            return []
        }
        return response.map(mapToInteractions)
    },
}