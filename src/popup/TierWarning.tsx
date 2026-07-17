import type { ReactNode } from 'react'
import type { TierInfo } from '../lib/tiers'
import { t } from '../i18n'

interface TierWarningProps {
  tier: TierInfo
  score: number
  destination?: string
  onCancel: () => void
  onProceed: () => void
  devControl?: ReactNode
}

export default function TierWarning({
  tier,
  score,
  destination,
  onCancel,
  onProceed,
  devControl,
}: TierWarningProps) {
  return (
    <div className="popup" style={{ borderTop: `4px solid ${tier.colour}` }}>
      {/* Icon paired with label so tier is never conveyed by colour alone (WCAG 1.4.1) */}
      <h1>
        <span className="tier-icon" aria-hidden="true">
          {tier.icon}
        </span>{' '}
        {t('warning.title', { tier: t(tier.labelKey) })}
      </h1>
      {destination && <p className="destination">{destination}</p>}
      <p className="score">{t('warning.score', { score })}</p>
      <p className="message">{t(tier.messageKey)}</p>
      <div className="actions">
        <button className="cancel" onClick={onCancel}>
          {t('warning.cancel')}
        </button>
        <button className="proceed" onClick={onProceed}>
          {t('warning.proceed')}
        </button>
      </div>
      {devControl}
    </div>
  )
}
