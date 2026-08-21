import { InteractionApiClient } from './interactionsApi'
import { beforeEach, describe, expect, it, vi } from 'vitest'

describe('InteractionApiClient', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('handles 200 with a list of interactions', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify([
          {
            id: '22cbd873-4930-49ec-9c80-830fb7b45f6d',
            customerId: 'CUS-1001',
            interactionType: 'NOTE',
            summary: 'Follow-up on billing question',
            correlationId: 'lab-request-001',
            createdAt: '2026-08-18T20:11:32.103582300Z',
          },
        ]),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    )

    const interactions = await InteractionApiClient.get('CUS-1001')

    expect(interactions).toEqual([
      {
        interactionId: '22cbd873-4930-49ec-9c80-830fb7b45f6d',
        customerId: 'CUS-1001',
        interactionType: 'NOTE',
        summary: 'Follow-up on billing question',
        correlationId: 'lab-request-001',
        createdAt: '2026-08-18T20:11:32.103582300Z',
      },
    ])
  })

  it('handles 204 with no interactions as an empty array', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: 204 }))

    const interactions = await InteractionApiClient.get('CUS-1002')

    expect(interactions).toEqual([])
  })

  it('handles 201 create', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          id: '19103e5c-22e4-4b87-af6e-f5736c42b88f',
          customerId: 'CUS-1001',
          interactionType: 'NOTE',
          summary: 'test interaction',
          correlationId: 'lab-request-001',
          createdAt: '2026-08-20T13:07:44.783295600Z',
        }),
        { status: 201, headers: { 'Content-Type': 'application/json' } },
      ),
    )

    const created = await InteractionApiClient.create({
      customerId: 'CUS-1001',
      interactionType: 'NOTE',
      summary: 'test interaction',
    })

    expect(created.interactionId).toBe('19103e5c-22e4-4b87-af6e-f5736c42b88f')
    expect(created.summary).toBe('test interaction')
  })

  it('sends the correlation header on create', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          id: '19103e5c-22e4-4b87-af6e-f5736c42b88f',
          customerId: 'CUS-1001',
          interactionType: 'NOTE',
          summary: 'test',
          correlationId: 'lab-request-001',
          createdAt: '2026-08-20T13:07:44.783295600Z',
        }),
        { status: 201, headers: { 'Content-Type': 'application/json' } },
      ),
    )

    await InteractionApiClient.create({ customerId: 'CUS-1001', interactionType: 'NOTE', summary: 'test' })

    const [, requestInit] = fetchSpy.mock.calls[0]
    expect(requestInit?.headers).toMatchObject({ 'X-Correlation-Id': 'lab-request-001' })
  })

  it('handles 400 validation failure', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          type: 'about:blank',
          title: 'Bad Request',
          status: 400,
          detail: 'summary: must not be blank',
          instance: '/api/v1/interactions',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      ),
    )

    await expect(
      InteractionApiClient.create({ customerId: 'CUS-1001', interactionType: 'NOTE', summary: '' }),
    ).rejects.toMatchObject({ kind: 'http', status: 400, message: 'summary: must not be blank' })
  })
})