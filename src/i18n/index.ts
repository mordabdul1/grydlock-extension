import { en } from './en'

export type MessageKey = keyof typeof en

/**
 * Minimal key-lookup i18n: a full locale is a complete key → string map;
 * registered locales may be partial and fall back to English per key. A
 * dedicated library (react-i18next & co.) would add meaningful bundle weight
 * to a popup that needs none of its features yet — this scaffold keeps the
 * same shape (keys + interpolation + locale registry) so swapping one in
 * later is mechanical.
 */
const locales: Record<string, Partial<Record<MessageKey, string>>> = { en }

let currentLocale = 'en'

/** Registers (or replaces) a locale. Missing keys fall back to English. */
export function registerLocale(name: string, messages: Partial<Record<MessageKey, string>>): void {
  locales[name] = messages
}

/** Switches the active locale; unknown locale names are ignored. */
export function setLocale(name: string): void {
  if (locales[name]) currentLocale = name
}

export function getLocale(): string {
  return currentLocale
}

/**
 * Resolves a message key in the active locale, interpolating `{param}`
 * placeholders. Unknown keys resolve to the key itself so a missed
 * extraction is visible in the UI rather than a crash.
 */
export function t(key: MessageKey, params?: Record<string, string | number>): string {
  const template = locales[currentLocale][key] ?? en[key] ?? key
  if (!params) return template
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in params ? String(params[name]) : match,
  )
}
