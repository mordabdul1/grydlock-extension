import type { Outcome } from './protocol'

/** Routes an unsigned XDR through the bridge → background → popup pipeline. */
export type RequestOutcome = (xdr: string) => Promise<Outcome>

/**
 * One wallet's interception strategy. Stellar has no universal injected
 * provider, so each wallet needs its own hook point; everything after the
 * hook (bridge, background, decode, scoring, popup) is shared and
 * wallet-agnostic.
 */
export interface WalletAdapter {
  wallet: string
  /** Registers the wallet-specific listener; returns a cleanup that removes it. */
  install: (requestOutcome: RequestOutcome) => () => void
}
