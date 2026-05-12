import { Commerce } from '../types'

const TTL_MS = 5 * 60 * 1000
const MAX_FETCHES = 24
const MAX_COMMERCES = 5000
const STORAGE_KEY = 'tchopmygrinds:commerceCache:v1'

interface FetchRecord {
  lat: number
  lng: number
  radius: number
  at: number
}

interface PersistedState {
  byId: Record<string, Commerce>
  fetches: FetchRecord[]
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRad = (d: number) => (d * Math.PI) / 180
  const R = 6371
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h))
}

class CommerceCache {
  private byId = new Map<number, Commerce>()
  private fetches: FetchRecord[] = []
  private hydrated = false

  private hydrate() {
    if (this.hydrated) return
    this.hydrated = true
    if (typeof window === 'undefined') return
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const data = JSON.parse(raw) as PersistedState
      const now = Date.now()
      this.byId = new Map(
        Object.entries(data.byId || {}).map(([id, c]) => [Number(id), c]),
      )
      this.fetches = (data.fetches || []).filter((f) => now - f.at < TTL_MS)
    } catch {
      // ignore corrupted state
    }
  }

  private persist() {
    if (typeof window === 'undefined') return
    try {
      const payload: PersistedState = {
        byId: Object.fromEntries(this.byId),
        fetches: this.fetches,
      }
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
    } catch {
      // quota exceeded or storage disabled — silently degrade
    }
  }

  private evictIfTooLarge() {
    if (this.byId.size <= MAX_COMMERCES) return
    // Drop random entries — without per-id access timestamp this is the simplest bound
    const excess = this.byId.size - MAX_COMMERCES
    const it = this.byId.keys()
    for (let i = 0; i < excess; i++) {
      const key = it.next().value
      if (key !== undefined) this.byId.delete(key)
    }
  }

  bulkSet(commerces: Commerce[]): void {
    this.hydrate()
    commerces.forEach((c) => {
      if (c && c.id != null) this.byId.set(c.id, c)
    })
    this.evictIfTooLarge()
    this.persist()
  }

  recordFetch(lat: number, lng: number, radius: number): void {
    this.hydrate()
    this.fetches.push({ lat, lng, radius, at: Date.now() })
    if (this.fetches.length > MAX_FETCHES) this.fetches.shift()
    this.persist()
  }

  // Retourne les commerces cachés couvrant la zone demandée si un fetch récent l'englobe
  getFresh(lat: number, lng: number, radius: number): Commerce[] | null {
    this.hydrate()
    const now = Date.now()
    const covered = this.fetches.some((f) => {
      if (now - f.at > TTL_MS) return false
      const centerDistance = haversineKm(lat, lng, f.lat, f.lng)
      return centerDistance + radius <= f.radius
    })
    if (!covered) return null

    return Array.from(this.byId.values())
      .filter((c) => c.latitude != null && c.longitude != null)
      .map((c) => ({ ...c, distance: haversineKm(lat, lng, c.latitude as number, c.longitude as number) }))
      .filter((c) => (c.distance as number) <= radius)
      .sort((a, b) => (a.distance as number) - (b.distance as number))
  }

  clear(): void {
    this.byId.clear()
    this.fetches = []
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.removeItem(STORAGE_KEY)
      } catch {
        // ignore
      }
    }
  }

  stats() {
    this.hydrate()
    return {
      commerces: this.byId.size,
      fetches: this.fetches.length,
    }
  }
}

export const commerceCache = new CommerceCache()
