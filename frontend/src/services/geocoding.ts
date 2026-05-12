export interface GeocodingResult {
  id: string
  displayName: string
  shortName: string
  latitude: number
  longitude: number
  type: string
  category: string
  importance: number
}

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search'

let abortController: AbortController | null = null

interface NominatimItem {
  place_id: number
  display_name: string
  lat: string
  lon: string
  type: string
  class: string
  importance?: number
  address?: Record<string, string>
}

export async function searchPlaces(
  query: string,
  opts?: { limit?: number; language?: string },
): Promise<GeocodingResult[]> {
  const trimmed = query?.trim() ?? ''
  if (trimmed.length < 3) return []

  abortController?.abort()
  abortController = new AbortController()

  const params = new URLSearchParams({
    q: trimmed,
    format: 'json',
    limit: String(opts?.limit ?? 6),
    addressdetails: '1',
    'accept-language': opts?.language ?? 'fr',
  })

  let response: Response
  try {
    response = await fetch(`${NOMINATIM_URL}?${params.toString()}`, {
      signal: abortController.signal,
      headers: { Accept: 'application/json' },
    })
  } catch (err) {
    if ((err as Error).name === 'AbortError') return []
    throw err
  }

  if (!response.ok) {
    throw new Error(`Nominatim error: ${response.status}`)
  }

  const data = (await response.json()) as NominatimItem[]

  return data.map((item) => {
    const addr = item.address || {}
    const shortName =
      addr.city ||
      addr.town ||
      addr.village ||
      addr.county ||
      addr.state ||
      item.display_name.split(',')[0]
    return {
      id: String(item.place_id),
      displayName: item.display_name,
      shortName,
      latitude: parseFloat(item.lat),
      longitude: parseFloat(item.lon),
      type: item.type,
      category: item.class,
      importance: item.importance ?? 0,
    }
  })
}
