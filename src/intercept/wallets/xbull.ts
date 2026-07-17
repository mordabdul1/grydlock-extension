import type { RequestOutcome, WalletAdapter } from '../walletAdapter'

/**
 * xBull (Creit-Tech/xBull-Wallet) injects `window.xBullSDK` into the page,
 * but the SDK is a thin postMessage client: `signTransaction` / `signXDR`
 * post `{ type: 'XBULL_SIGN_XDR', eventId, detail: { xdr, xdrType, ... } }`
 * to `window`, and xBull's content script replies with
 * `{ returnFromCS: true, eventId, detail }` the same way. As with Freighter,
 * that postMessage layer is the interception point — the injected SDK object
 * itself never needs to be touched.
 */
const XBULL_SIGN_XDR = 'XBULL_SIGN_XDR'

interface XBullSignXdrRequest {
  type: typeof XBULL_SIGN_XDR
  eventId: string
  detail: {
    origin: string
    host: string
    xdr: string
    xdrType: 'Transaction' | 'AuthEntry'
    publicKey?: string
    network?: string
  }
  returnFromCS?: boolean
  __grydlockReviewed?: boolean
}

/**
 * Grabs an outgoing XBULL_SIGN_XDR request before xBull's own content-script
 * listener sees it (same registration-order caveat as Freighter). Only
 * `xdrType: 'Transaction'` requests are reviewed — AuthEntry payloads are not
 * transactions and carry no destination to score. On 'cancel', an error
 * response is synthesized in xBull's own response shape so the dApp's SDK
 * call rejects exactly as if the wallet had declined; on 'allow'/'proceed',
 * the original request is re-posted (tagged) for xBull to handle unchanged.
 */
export const xBullAdapter: WalletAdapter = {
  wallet: 'xBull',
  install(requestOutcome: RequestOutcome) {
    const onMessage = (event: MessageEvent) => {
      if (event.source !== window) return
      const data = event.data as Partial<XBullSignXdrRequest> | undefined
      if (
        data?.type !== XBULL_SIGN_XDR ||
        data.returnFromCS ||
        data.__grydlockReviewed ||
        typeof data.eventId !== 'string' ||
        typeof data.detail?.xdr !== 'string' ||
        data.detail.xdrType !== 'Transaction'
      ) {
        return
      }

      event.stopImmediatePropagation()
      const request = data as XBullSignXdrRequest

      requestOutcome(request.detail.xdr).then((outcome) => {
        if (outcome === 'cancel') {
          window.postMessage(
            {
              returnFromCS: true,
              eventId: request.eventId,
              detail: {
                error: true,
                code: -4,
                errorMessage:
                  'Rejected by Gryd Lock: user cancelled after reviewing the risk warning.',
              },
            },
            window.location.origin,
          )
          return
        }

        window.postMessage({ ...request, __grydlockReviewed: true }, window.location.origin)
      })
    }

    window.addEventListener('message', onMessage, true)
    return () => window.removeEventListener('message', onMessage, true)
  },
}
