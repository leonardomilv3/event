import { useState, useEffect } from 'react'
import { type EventResponse, type ParticipantResponse } from '../types/api'
import { getById, getParticipants } from '../services/eventService'
import { ApiError } from '../services/httpClient'

export interface EventState {
  event: EventResponse | null
  participants: ParticipantResponse[]
  loading: boolean
  error: string | null
}

export function useEvent(eventId: string): EventState {
  const [event, setEvent] = useState<EventResponse | null>(null)
  const [participants, setParticipants] = useState<ParticipantResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!eventId) return
    let cancelled = false

    Promise.all([getById(eventId), getParticipants(eventId)])
      .then(([ev, page]) => {
        if (cancelled) return
        setEvent(ev)
        setParticipants(page.content)
        setError(null)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setError(err instanceof ApiError ? err.message : 'Erro ao carregar evento')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [eventId])

  return { event, participants, loading, error }
}
