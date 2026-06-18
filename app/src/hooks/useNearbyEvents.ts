import { useState, useEffect } from 'react'
import { type EventResponse } from '../types/api'
import { getNearby } from '../services/eventService'
import { ApiError } from '../services/httpClient'

const BRASILIA_LAT = -15.7942
const BRASILIA_LON = -47.8825

interface Location {
  lat: number
  lon: number
}

export interface NearbyEventsState {
  events: EventResponse[]
  loading: boolean
  error: string | null
}

export function useNearbyEvents(radius = 10): NearbyEventsState {
  const [location, setLocation] = useState<Location | null>(null)
  const [events, setEvents] = useState<EventResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Resolve geolocation once on mount
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      () => setLocation({ lat: BRASILIA_LAT, lon: BRASILIA_LON })
    )
  }, [])

  // Fetch whenever location resolves or radius changes
  useEffect(() => {
    if (!location) return
    let cancelled = false

    getNearby(location.lat, location.lon, radius)
      .then((res) => {
        if (!cancelled) {
          setEvents(res.content)
          setError(null)
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : 'Erro ao buscar eventos próximos')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [location, radius])

  return { events, loading, error }
}
