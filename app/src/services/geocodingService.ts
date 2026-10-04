import { type AddressSuggestion } from '../types/geocoding'

// Photon (komoot) — geocoder sobre OpenStreetMap, sem chave. Ver ADR-013.
const PHOTON_URL = 'https://photon.komoot.io/api/'
// Sem bbox, termos genéricos ("Teatro Nacional") retornam resultados de outros países.
// O bbox é retangular e ainda inclui vizinhos — por isso o filtro por countrycode abaixo.
const BRAZIL_BBOX = '-74.0,-33.8,-34.7,5.3'
const MAX_SUGGESTIONS = 6
const NON_VENUE_OSM_KEYS = new Set(['highway', 'place', 'boundary', 'building'])

interface PhotonProperties {
  osm_id: number
  osm_type: string
  osm_key?: string
  countrycode?: string
  name?: string
  street?: string
  housenumber?: string
  district?: string
  locality?: string
  city?: string
  state?: string
}

interface PhotonFeature {
  geometry: { coordinates: [number, number] }
  properties: PhotonProperties
}

interface PhotonResponse {
  features: PhotonFeature[]
}

function toSuggestion({ geometry, properties: p }: PhotonFeature): AddressSuggestion {
  const [longitude, latitude] = geometry.coordinates
  const isVenue = Boolean(p.name) && p.name !== p.street && !NON_VENUE_OSM_KEYS.has(p.osm_key ?? '')
  const streetLine = p.street ? [p.street, p.housenumber].filter(Boolean).join(', ') : undefined
  const firstLine = streetLine ?? (isVenue ? undefined : p.name)
  const area = [p.district ?? p.locality, p.city].filter(Boolean).join(', ')
  const state = p.state !== p.city ? p.state : undefined
  const address = [firstLine, area, state].filter(Boolean).join(' - ')

  return {
    id: `${p.osm_type}${p.osm_id}`,
    label: (isVenue ? p.name : firstLine) ?? address,
    address,
    venueName: isVenue ? p.name : undefined,
    latitude,
    longitude,
  }
}

export async function searchAddress(query: string, signal?: AbortSignal): Promise<AddressSuggestion[]> {
  const q = new URLSearchParams({ q: query, limit: String(MAX_SUGGESTIONS * 2), bbox: BRAZIL_BBOX })
  const res = await fetch(`${PHOTON_URL}?${q}`, { signal })
  if (!res.ok) throw new Error(`Photon ${res.status}`)
  const data = (await res.json()) as PhotonResponse

  const seen = new Set<string>()
  return data.features
    .filter((f) => f.properties.countrycode === 'BR')
    .map(toSuggestion)
    .filter((s) => {
      const key = `${s.label}|${s.address}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    .slice(0, MAX_SUGGESTIONS)
}
