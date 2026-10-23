/**
 * English locale — the reference locale. Every user-facing string in the
 * extension lives here (or in a sibling locale file), never inline in
 * component or logic files. Keys missing from other locales fall back to
 * these values.
 */
export const en = {
  'tier.low.label': 'Low',
  'tier.low.message': 'No signs of a risky destination.',
  'tier.elevated.label': 'Elevated',
  'tier.elevated.message': 'Some unusual signals — double-check the destination.',
  'tier.high.label': 'High',
  'tier.high.message': 'Strong indicators of risk. Confirm you trust this destination.',
  'tier.critical.label': 'Critical',
  'tier.critical.message': 'This destination looks fraudulent. Cancelling is strongly recommended.',
  'warning.title': '{tier} risk',
  'warning.score': 'Score: {score}',
  'warning.cancel': 'Cancel',
  'warning.proceed': 'Proceed',
  'popup.loading': 'Checking destination…',
  'popup.oracleError': 'Could not reach the risk oracle.',
  'popup.retry': 'Retry',
  'dev.overrideScore': 'Dev: override score ({score})',
}
