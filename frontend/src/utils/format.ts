/**
 * Utilitaires de formatage pour l'affichage des données
 */

import { getCurrencyDef } from '../lib/currencyRegistry'

/**
 * Formate un rating en nombre sûr pour l'affichage
 */
export const formatRating = (rating: any): number => {
  const num = Number(rating)
  return isNaN(num) ? 0 : num
}

/**
 * Formate une distance en km avec 1 décimale
 */
export const formatDistance = (distance: any): string => {
  const num = Number(distance)
  return isNaN(num) ? '0.0' : num.toFixed(1)
}

/**
 * Formate un rating pour l'affichage (avec 1 décimale)
 */
export const formatRatingDisplay = (rating: any): string => {
  return formatRating(rating).toFixed(1)
}

/**
 * Format a price for display, respecting the merchant's currency.
 *
 * Driven by the currency registry (see `lib/currencyRegistry.ts`) — the
 * decimals and suffix come from the live `currencies` table, not from a
 * compile-time switch. Adding a new currency is one INSERT, no TS edit.
 *
 * `Intl.NumberFormat` handles the locale-specific grouping (non-breaking
 * spaces, comma vs. dot). The currency arg is optional so legacy call
 * sites that haven't been threaded with a commerce currency degrade
 * gracefully to EUR rather than crashing.
 */
export const formatPrice = (
  amount: unknown,
  currency: string | null | undefined = 'EUR',
): string => {
  const num = Number(amount)
  if (!Number.isFinite(num)) return '—'
  const def = getCurrencyDef(currency)
  const rounded = def.decimals === 0 ? Math.round(num) : num
  const formatted = new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: def.decimals,
    maximumFractionDigits: def.decimals,
  }).format(rounded)
  return `${formatted} ${def.suffix}`
}

/**
 * Currency suffix only — for places that already display the amount and
 * just need to know what currency to label it with (e.g. an input field's
 * adornment). Reads from the registry.
 */
export const currencySymbol = (currency: string | null | undefined): string => {
  return getCurrencyDef(currency).suffix
}
