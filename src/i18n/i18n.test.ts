import { afterEach, describe, expect, it } from 'vitest'
import { getLocale, registerLocale, setLocale, t, type MessageKey } from './index'
import { en } from './en'
import { tierForScore } from '../lib/tiers'

afterEach(() => {
  setLocale('en')
})

describe('t', () => {
  it('resolves a key in the default English locale', () => {
    expect(t('warning.cancel')).toBe('Cancel')
  })

  it('interpolates {param} placeholders', () => {
    expect(t('warning.title', { tier: 'Critical' })).toBe('Critical risk')
    expect(t('warning.score', { score: 85 })).toBe('Score: 85')
  })

  it('leaves unmatched placeholders intact', () => {
    expect(t('warning.title', {})).toBe('{tier} risk')
  })

  it('returns the key itself for an unknown key so missed extractions are visible', () => {
    expect(t('no.such.key' as MessageKey)).toBe('no.such.key')
  })
})

describe('locale registry', () => {
  it('switches to a registered locale and falls back to English per missing key', () => {
    registerLocale('xx', { 'warning.cancel': 'Xancel' })
    setLocale('xx')
    expect(getLocale()).toBe('xx')
    expect(t('warning.cancel')).toBe('Xancel')
    expect(t('warning.proceed')).toBe('Proceed')
  })

  it('ignores setLocale for an unregistered locale', () => {
    setLocale('does-not-exist')
    expect(getLocale()).toBe('en')
  })
})

describe('string extraction completeness', () => {
  it('every tier references label and message keys that exist in the English locale', () => {
    for (const score of [0, 21, 51, 76]) {
      const tier = tierForScore(score)
      expect(en[tier.labelKey], `missing ${tier.labelKey}`).toBeTruthy()
      expect(en[tier.messageKey], `missing ${tier.messageKey}`).toBeTruthy()
    }
  })
})
