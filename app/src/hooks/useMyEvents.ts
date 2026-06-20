import { useState, useEffect } from 'react'
import { type EventResponse } from '../types/api'
import { getMyEvents } from '../services/userService'
import { ApiError } from '../services/httpClient'

export interface MyEventsState {
  events: EventResponse[]
  loading: boolean
  error: string | null
}

export function useMyEvents(): MyEventsState {
  const [events, setEvents] = useState<EventResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    getMyEvents()
      .then((res) => {
        if (!cancelled) {
          setEvents(res.content)
          setError(null)
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : 'Erro ao carregar seus eventos')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  return { events, loading, error }
}
