import { requestOutcome } from './requestOutcome'
import { freighterAdapter } from './wallets/freighter'
import { xBullAdapter } from './wallets/xbull'

const adapters = [freighterAdapter, xBullAdapter]

for (const adapter of adapters) {
  adapter.install(requestOutcome)
}
