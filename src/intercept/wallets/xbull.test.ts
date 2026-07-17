import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from 'vitest'
import { xBullAdapter } from './xbull'
import type { Outcome } from '../protocol'

function signRequest(overrides: Record<string, unknown> = {}) {
  return {
    type: 'XBULL_SIGN_XDR',
    eventId: 'evt-1',
    detail: {
      origin: window.origin,
      host: 'dapp.example',
      xdr: 'AAAA-unsigned-xdr',
      xdrType: 'Transaction',
    },
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

describe('xBullAdapter', () => {
  let requestOutcome: Mock<(xdr: string) => Promise<Outcome>>
  let postSpy: Mock
  let uninstall: () => void

  beforeEach(() => {
    requestOutcome = vi.fn()
    postSpy = vi.spyOn(window, 'postMessage').mockImplementation(() => {}) as unknown as Mock
    uninstall = xBullAdapter.install(requestOutcome)
  })

  afterEach(() => {
    uninstall()
    vi.restoreAllMocks()
  })

  it('intercepts a sign request and re-posts it tagged on proceed', async () => {
    requestOutcome.mockResolvedValue('proceed')
    const request = signRequest()
    const stopSpy = dispatch(request)
    await flush()

    expect(stopSpy).toHaveBeenCalled()
    expect(requestOutcome).toHaveBeenCalledWith('AAAA-unsigned-xdr')
    expect(postSpy).toHaveBeenCalledWith(
      { ...request, __grydlockReviewed: true },
      window.location.origin,
    )
  })

  it('re-posts the request unchanged on allow', async () => {
    requestOutcome.mockResolvedValue('allow')
    const request = signRequest()
    dispatch(request)
    await flush()

    expect(postSpy).toHaveBeenCalledWith(
      { ...request, __grydlockReviewed: true },
      window.location.origin,
    )
  })

  it("synthesizes an error response in xBull's shape on cancel", async () => {
    requestOutcome.mockResolvedValue('cancel')
    dispatch(signRequest({ eventId: 'evt-cancel' }))
    await flush()

    expect(postSpy).toHaveBeenCalledTimes(1)
    expect(postSpy).toHaveBeenCalledWith(
      {
        returnFromCS: true,
        eventId: 'evt-cancel',
        detail: {
          error: true,
          code: -4,
          errorMessage: 'Rejected by Gryd Lock: user cancelled after reviewing the risk warning.',
        },
      },
      window.location.origin,
    )
  })

  it('ignores its own re-posted (reviewed) requests', async () => {
    dispatch(signRequest({ __grydlockReviewed: true }))
    await flush()
    expect(requestOutcome).not.toHaveBeenCalled()
  })

  it('ignores content-script responses (returnFromCS)', async () => {
    dispatch(signRequest({ returnFromCS: true }))
    await flush()
    expect(requestOutcome).not.toHaveBeenCalled()
  })

  it('ignores non-Transaction xdrTypes (AuthEntry has no destination to score)', async () => {
    const request = signRequest()
    ;(request.detail as { xdrType: string }).xdrType = 'AuthEntry'
    const stopSpy = dispatch(request)
    await flush()

    expect(stopSpy).not.toHaveBeenCalled()
    expect(requestOutcome).not.toHaveBeenCalled()
  })

  it('ignores unrelated messages', async () => {
    dispatch({ type: 'XBULL_GET_PUBLIC_KEY', eventId: 'evt-2', detail: {} })
    await flush()
    expect(requestOutcome).not.toHaveBeenCalled()
  })
})
