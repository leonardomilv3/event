import { useEffect, useMemo, useState } from 'react'
import type { EventResponse } from '../types/api'
import { getEventsForMonth } from '../services/calendarService'
import { groupEventsByDay } from '../utils/calendar'

interface State {
  eventsByDay: Map<number, EventResponse[]>
  loading: boolean
  error: string | null
}

export function useMonthEvents(year: number, month: number): State {
  const [events, setEvents] = useState<EventResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    getEventsForMonth(year, month)
      .then((data) => {
        if (!cancelled) setEvents(data)
      })
      .catch(() => {
        if (!cancelled) setError('error')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [year, month])

  const eventsByDay = useMemo(
    () => groupEventsByDay(events, year, month),
    [events, year, month],
  )

  return { eventsByDay, loading, error }
}