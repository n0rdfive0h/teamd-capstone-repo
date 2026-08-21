import { CustomerApiClient } from './customersApi'
import { describe, beforeEach, vi, it, expect } from 'vitest'

describe('CustomerApiClient', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('handles 200 search with Amina and Ravi', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify([
          { customerId: 'CUS-1001', fullName: 'Amina Khan', email: 'amina.khan@example.test', status: 'ACTIVE' },
          { customerId: 'CUS-1002', fullName: 'Ravi Singh', email: 'ravi.singh@example.test', status: 'PROSPECT' },
        ]),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    )

    const customers = await CustomerApiClient.search('')

    expect(customers).toEqual([
      { customerId: 'CUS-1001', fullName: 'Amina Khan', email: 'amina.khan@example.test', status: 'ACTIVE' },
      { customerId: 'CUS-1002', fullName: 'Ravi Singh', email: 'ravi.singh@example.test', status: 'PROSPECT' },
    ])
  })

  it('returns an empty array when search matches nothing', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify([]), { status: 200, headers: { 'Content-Type': 'application/json' } }),
    )

    const customers = await CustomerApiClient.search('nonexistent')

    expect(customers).toEqual([])
  })

  it('handles getProfile for a known customer', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({ customerId: 'CUS-1001', fullName: 'Amina Khan', email: 'amina.khan@example.test', status: 'ACTIVE' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    )

    const customer = await CustomerApiClient.getProfile('CUS-1001')

    expect(customer).toEqual({
      customerId: 'CUS-1001',
      fullName: 'Amina Khan',
      email: 'amina.khan@example.test',
      status: 'ACTIVE',
    })
  })

  it('handles a 404 for an unknown customer', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          type: 'about:blank',
          title: 'Not Found',
          status: 404,
          detail: 'Customer CUS-9999 not found',
          instance: '/api/v1/customers/CUS-9999',
        }),
        { status: 404, headers: { 'Content-Type': 'application/json' } },
      ),
    )

    await expect(CustomerApiClient.getProfile('CUS-9999')).rejects.toMatchObject({
      kind: 'http',
      status: 404,
      message: 'Customer CUS-9999 not found',
    })
  })

  it('handles 201 create', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({ customerId: 'CUS-1003', fullName: 'John Smith', email: 'john@example.com', status: 'PROSPECT' }),
        { status: 201, headers: { 'Content-Type': 'application/json' } },
      ),
    )

    const created = await CustomerApiClient.create({ fullName: 'John Smith', email: 'john@example.com' })

    expect(created).toEqual({
      customerId: 'CUS-1003',
      fullName: 'John Smith',
      email: 'john@example.com',
      status: 'PROSPECT',
    })
  })

  it('handles 400 on create with an invalid email', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          type: 'about:blank',
          title: 'Bad Request',
          status: 400,
          detail: 'email: must be a well-formed email address',
          instance: '/api/v1/customers',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      ),
    )

    await expect(
      CustomerApiClient.create({ fullName: 'John Smith', email: 'bad-email' }),
    ).rejects.toMatchObject({ kind: 'http', status: 400, message: 'email: must be a well-formed email address' })
  })

  it('sends the correct body shape for updateStatus', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({ customerId: 'CUS-1001', fullName: 'Amina Khan', email: 'amina.khan@example.test', status: 'CLOSED' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    )

    await CustomerApiClient.updateStatus('CUS-1001', 'CLOSED')

    const [, requestInit] = fetchSpy.mock.calls[0]
    expect(requestInit?.method).toBe('PATCH')
    expect(JSON.parse(requestInit?.body as string)).toEqual({ newStatus: 'CLOSED' })
  })

  it('handles 409 on an illegal status transition', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          type: 'about:blank',
          title: 'Conflict',
          status: 409,
          detail: 'Cannot transition from CLOSED to PROSPECT',
          instance: '/api/v1/customers/CUS-1001/status',
        }),
        { status: 409, headers: { 'Content-Type': 'application/json' } },
      ),
    )

    await expect(CustomerApiClient.updateStatus('CUS-1001', 'PROSPECT')).rejects.toMatchObject({
      kind: 'http',
      status: 409,
    })
  })

  it('handles network failure', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Network failure'))

    await expect(CustomerApiClient.search('')).rejects.toMatchObject({ kind: 'network' })
  })

  it('handles abort', async () => {
    const controller = new AbortController()
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new DOMException('The operation was aborted.', 'AbortError'))

    const promise = CustomerApiClient.search('', controller.signal)
    controller.abort()

    await expect(promise).rejects.toMatchObject({ kind: 'abort' })
  })
})