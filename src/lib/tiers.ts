import type { MessageKey } from '../i18n'

export type Tier = 'low' | 'elevated' | 'high' | 'critical'

export interface TierInfo {
  tier: Tier
  /** i18n key for the tier's short label — resolve with t() at render time. */
  labelKey: MessageKey
  /** Hex colour used for visual accents (border, badge).
   *  All values meet WCAG 2.1 AA contrast (≥ 4.5:1) against white (#ffffff). */
  colour: string
  /** Unicode icon that conveys tier without relying on colour alone. */
  icon: string
  /** i18n key for the tier's warning message — resolve with t() at render time. */
  messageKey: MessageKey
}

const TIERS: Array<{ max: number; info: TierInfo }> = [
  {
    max: 20,
    info: {
      tier: 'low',
      labelKey: 'tier.low.label',
      colour: '#2e7d32', // 5.13:1 on white — WCAG AA ✓
      icon: '✓',
      messageKey: 'tier.low.message',
    },
  },
  {
    max: 50,
    info: {
      tier: 'elevated',
      labelKey: 'tier.elevated.label',
      colour: '#a86300', // 4.72:1 on white — WCAG AA ✓  (was #f9a825 @ 1.97:1 — FAIL)
      icon: '⚠',
      messageKey: 'tier.elevated.message',
    },
  },
  {
    max: 75,
    info: {
      tier: 'high',
      labelKey: 'tier.high.label',
      colour: '#bf360c', // 5.60:1 on white — WCAG AA ✓  (was #ef6c00 @ 3.08:1 — FAIL)
      icon: '⚠',
      messageKey: 'tier.high.message',
    },
  },
  {
    max: 100,
    info: {
      tier: 'critical',
      labelKey: 'tier.critical.label',
      colour: '#c62828', // 5.62:1 on white — WCAG AA ✓
      icon: '✕',
      messageKey: 'tier.critical.message',
    },
  },
]

export function tierForScore(score: number): TierInfo {
  const clamped = Math.max(0, Math.min(100, score))
  const match = TIERS.find(({ max }) => clamped <= max)
  return match!.info
}
