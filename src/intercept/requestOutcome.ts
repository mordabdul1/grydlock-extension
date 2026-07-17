import { WINDOW_REQUEST_TYPE, WINDOW_RESPONSE_TYPE, type Outcome } from './protocol'

/**
 * Asks the extension what should happen to a pending signing request:
 * posts the XDR to the bridge content script (the only piece with chrome.*
 * access) and resolves with the outcome the background worker reports back.
 */
export function requestOutcome(xdr: string): Promise<Outcome> {
  const requestId = crypto.randomUUID()

  return new Promise((resolve) => {
    function onMessage(event: MessageEvent) {
      if (event.source !== window) return
      const data = event.data as { type?: string; requestId?: string; outcome?: string } | undefined
      if (data?.type !== WINDOW_RESPONSE_TYPE || data.requestId !== requestId) return
      window.removeEventListener('message', onMessage)
      const outcome = data.outcome
      resolve(outcome === 'proceed' || outcome === 'allow' ? outcome : 'cancel')
    }
    window.addEventListener('message', onMessage)
    window.postMessage({ type: WINDOW_REQUEST_TYPE, requestId, xdr }, '*')
  })
}
