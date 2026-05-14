/**
 * Currency registry — single source of truth for the price-formatting layer.
 *
 * Architecture: the canonical list lives in the Rails `currencies` table,
 * served by `GET /api/v1/currencies`. The frontend hydrates this module's
 * singleton at boot from (in order of precedence):
 *   1. The API response (authoritative)
 *   2. The last successful API response cached in localStorage (offline / cold start)
 *   3. A baked-in FALLBACK of the 3 currencies known at build time
 *
 * The baked-in fallback exists so `formatPrice` cannot crash even if the
 * registry has not been hydrated yet (synchronous module load, no network).
 */

export interface CurrencyDef {
  /** ISO-4217 3-letter code, uppercase. */
  code: string
  /** Human-facing label for dropdowns ("€ Euro (zone euro)"). */
  label: string
  /** Number of fractional digits to display. 0 for currencies without a minor unit. */
  decimals: number
  /** Visible suffix appended after the formatted amount ("€", "FCFA", "Br"). */
  suffix: string
}

const STORAGE_KEY = 'tchopmygrinds:currencies:v1'

const FALLBACK: CurrencyDef[] = [
  { code: 'EUR', label: '€ Euro (zone euro)', decimals: 2, suffix: '€' },
  { code: 'XAF', label: 'FCFA Franc CFA (Cameroun, Tchad, Congo…)', decimals: 0, suffix: 'FCFA' },
  { code: 'ETB', label: 'Br Birr éthiopien (Éthiopie)', decimals: 2, suffix: 'Br' },
]

let registry: Map<string, CurrencyDef> = new Map(FALLBACK.map((c) => [c.code, c]))

// Synchronously hydrate from localStorage at module load. Done here (not in
// main.tsx) so any module that imports `formatPrice` already gets the last
// known list, even if its first call happens before the API responds.
try {
  if (typeof localStorage !== 'undefined') {
    const cached = localStorage.getItem(STORAGE_KEY)
    if (cached) {
      const parsed = JSON.parse(cached)
      if (Array.isArray(parsed) && parsed.length > 0 && parsed.every(isCurrencyDef)) {
        registry = new Map(parsed.map((c: CurrencyDef) => [c.code, c]))
      }
    }
  }
} catch {
  // Corrupted JSON or unavailable storage — fall back silently. The next
  // successful API fetch will overwrite this.
}

function isCurrencyDef(x: unknown): x is CurrencyDef {
  if (!x || typeof x !== 'object') return false
  const o = x as Record<string, unknown>
  return (
    typeof o.code === 'string' &&
    typeof o.label === 'string' &&
    typeof o.decimals === 'number' &&
    typeof o.suffix === 'string'
  )
}

/**
 * Replace the in-memory registry and persist to localStorage. Called once
 * from `main.tsx` after the API fetch resolves. Subsequent calls (admin
 * editing the registry, for example) also overwrite the cache.
 */
export function setCurrencyRegistry(defs: CurrencyDef[]): void {
  if (!Array.isArray(defs) || defs.length === 0) return
  const filtered = defs.filter(isCurrencyDef)
  if (filtered.length === 0) return
  registry = new Map(filtered.map((c) => [c.code.toUpperCase(), c]))
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
    }
  } catch {
    // Storage may be full or disabled (private mode) — registry is still
    // updated in memory, so the UI works for this session.
  }
}

/**
 * Look up a currency def. Falls back to EUR (the marketplace default) if
 * the code is missing — never returns null, so callers don't have to guard.
 */
export function getCurrencyDef(code: string | null | undefined): CurrencyDef {
  const key = (code || 'EUR').toString().toUpperCase()
  return registry.get(key) ?? registry.get('EUR') ?? FALLBACK[0]
}

/**
 * Full list, sorted by code. Used by VendorProfile's dropdown.
 */
export function getAllCurrencies(): CurrencyDef[] {
  return Array.from(registry.values()).sort((a, b) => a.code.localeCompare(b.code))
}
