export type InteractionType = 'CALL' | 'EMAIL' | 'NOTE' | 'MEETING'

export interface Interaction {
    interactionId: string,
    customerId: string,
    interactionType:InteractionType,
    summary:string,
    correlationId?:string
    createdAt:string,
}

export interface InteractionDraft {
    customerId:string,
    interactionType:InteractionType,
    summary:string,
    correlationId?:string,
}

