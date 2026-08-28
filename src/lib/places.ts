const PHOTON_URL =
  import.meta.env.VITE_PHOTON_URL?.trim() || 'https://photon.komoot.io/api'

const RWANDA_BBOX = '28.8617,-2.8406,30.8996,-1.0475'
const KIGALI = { lat: '-1.9441', lon: '30.0619' }

export interface PlaceSuggestion {
  description: string
  latitude: string | null
  longitude: string | null
  placeId: string
}

export type ResolvedPlace = {
  label: string
  latitude: string | null
  longitude: string | null
  placeId: string
}

interface PhotonProperties {
  city?: string
  country?: string
  county?: string
  district?: string
  housenumber?: string
  name?: string
  osm_id?: number
  osm_type?: string
  postcode?: string
  state?: string
  street?: string
}

interface PhotonFeature {
  geometry?: { coordinates?: [number, number] }
  properties?: PhotonProperties
}

function describe(properties: PhotonProperties): string {
  const street = properties.housenumber && properties.street
    ? `${properties.housenumber} ${properties.street}`
    : properties.street

  const parts = [
    street || properties.name,
    street && properties.name !== street ? properties.name : undefined,
    properties.district,
    properties.city || properties.county,
    properties.state,
    properties.country,
  ]

  const seen = new Set<string>()
  return parts
    .filter((part): part is string => Boolean(part && part.trim()))
    .filter((part) => {
      const key = part.toLowerCase()
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    .join(', ')
}

function toSuggestion(feature: PhotonFeature): PlaceSuggestion | null {
  const properties = feature.properties
  if (!properties) return null
  const description = describe(properties)
  if (!description) return null
  const [longitude, latitude] = feature.geometry?.coordinates ?? []
  return {
    description,
    latitude: typeof latitude === 'number' ? String(latitude) : null,
    longitude: typeof longitude === 'number' ? String(longitude) : null,
    placeId: properties.osm_type && properties.osm_id
      ? `${properties.osm_type}:${properties.osm_id}`
      : description,
  }
}

export async function suggestPlaces(
  input: string,
  signal?: AbortSignal,
): Promise<PlaceSuggestion[]> {
  const query = input.trim()
  if (query.length < 3) return []

  const url = new URL(PHOTON_URL)
  url.searchParams.set('q', query)
  url.searchParams.set('limit', '6')
  url.searchParams.set('lang', 'en')
  url.searchParams.set('bbox', RWANDA_BBOX)
  url.searchParams.set('lat', KIGALI.lat)
  url.searchParams.set('lon', KIGALI.lon)

  try {
    const response = await fetch(url, { signal })
    if (!response.ok) return []
    const body = (await response.json()) as { features?: PhotonFeature[] }
    const seen = new Set<string>()
    return (body.features ?? [])
      .map(toSuggestion)
      .filter((item): item is PlaceSuggestion => item !== null)
      .filter((item) => {
        if (seen.has(item.description)) return false
        seen.add(item.description)
        return true
      })
  } catch {
    return []
  }
}

export function resolvePlace(suggestion: PlaceSuggestion): ResolvedPlace {
  return {
    label: suggestion.description,
    latitude: suggestion.latitude,
    longitude: suggestion.longitude,
    placeId: suggestion.placeId,
  }
}

export function mapsLink(value: {
  addressLabel?: string | null
  addressLatitude?: string | null
  addressLongitude?: string | null
}): string | null {
  if (value.addressLatitude && value.addressLongitude) {
    return `https://www.google.com/maps/search/?api=1&query=${value.addressLatitude},${value.addressLongitude}`
  }
  if (value.addressLabel) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(value.addressLabel)}`
  }
  return null
}
