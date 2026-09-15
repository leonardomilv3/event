import { useState, useEffect } from 'react'
import { type EventResponse } from '../types/api'
import { getEventsByCreator } from '../services/eventService'
import { ApiError } from '../services/httpClient'
import { useAuthContext } from './useAuthContext'

export interface CreatedEventsState {
  events: EventResponse[]
  loading: boolean
  error: string | null
}

export function useCreatedEvents(): CreatedEventsState {
  const { user } = useAuthContext()
  const [events, setEvents] = useState<EventResponse[]>([])
  const [loading, setLoading] = useState(() => !!user?.id)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user?.id) return

    let cancelled = false
    getEventsByCreator(user.id)
      .then((res) => {
        if (!cancelled) {
          setEvents(res.content)
          setError(null)
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : 'Erro ao carregar eventos criados')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [user?.id])

  return { events, loading, error }
}
