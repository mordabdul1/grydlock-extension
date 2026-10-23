import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from 'vitest'
import { freighterAdapter } from './freighter'
import type { Outcome } from '../protocol'

function submitRequest(overrides: Record<string, unknown> = {}) {
  return {
    source: 'FREIGHTER_EXTERNAL_MSG_REQUEST',
    type: 'SUBMIT_TRANSACTION',
    messageId: 7,
    transactionXdr: 'AAAA-unsigned-xdr',
    ...overrides,
  }
}

function dispatch(data: unknown) {
  const event = new MessageEvent('message', {
    data,
    source: window,
    origin: window.location.origin,
  })
  const stopSpy = vi.spyOn(event, 'stopImmediatePropagation')
  window.dispatchEvent(event)
  return stopSpy
}

async function flush() {
  await Promise.resolve()
  await Promise.resolve()
}

describe('freighterAdapter', () => {
  let requestOutcome: Mock<(xdr: string) => Promise<Outcome>>
  let postSpy: Mock
  let uninstall: () => void

  beforeEach(() => {
    requestOutcome = vi.fn()
    postSpy = vi.spyOn(window, 'postMessage').mockImplementation(() => {}) as unknown as Mock
    uninstall = freighterAdapter.install(requestOutcome)
  })

  afterEach(() => {
    uninstall()
    vi.restoreAllMocks()
  })

  it('intercepts a submit request and re-posts it tagged on proceed', async () => {
    requestOutcome.mockResolvedValue('proceed')
    const request = submitRequest()
    const stopSpy = dispatch(request)
    await flush()

    expect(stopSpy).toHaveBeenCalled()
    expect(requestOutcome).toHaveBeenCalledWith('AAAA-unsigned-xdr')
    expect(postSpy).toHaveBeenCalledWith(
      { ...request, __grydlockReviewed: true },
      window.location.origin,
    )
  })

  it('synthesizes a decline response on cancel', async () => {
    requestOutcome.mockResolvedValue('cancel')
    dispatch(submitRequest({ messageId: 42 }))
    await flush()

    expect(postSpy).toHaveBeenCalledTimes(1)
    const [response] = postSpy.mock.calls[0]
    expect(response).toMatchObject({
      source: 'FREIGHTER_EXTERNAL_MSG_RESPONSE',
      messagedId: 42,
      signedTransaction: '',
      apiError: { code: -4 },
    })
  })

  it('ignores its own re-posted (reviewed) requests', async () => {
    dispatch(submitRequest({ __grydlockReviewed: true }))
    await flush()
    expect(requestOutcome).not.toHaveBeenCalled()
  })

  it('ignores unrelated messages', async () => {
    dispatch({ source: 'SOMETHING_ELSE', type: 'SUBMIT_TRANSACTION', transactionXdr: 'x' })
    await flush()
    expect(requestOutcome).not.toHaveBeenCalled()
  })
})
