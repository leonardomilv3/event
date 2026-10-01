import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { type CreateEventRequest, type UpdateEventRequest, type EventResponse } from '../types/api'
import { createEvent, updateEvent, deleteEvent, publishEvent } from '../services/eventService'
import { ApiError } from '../services/httpClient'
import posthog from '../lib/posthog'
import { eventLifecycleLogger } from '../lib/posthogLogs'

export interface EventFormState {
  saving: boolean
  deleting: boolean
  error: string | null
  create: (data: CreateEventRequest, publishNow: boolean) => Promise<void>
  update: (id: string, data: UpdateEventRequest) => Promise<EventResponse | void>
  cancelEvent: (id: string) => Promise<void>
}

export function useEventForm(): EventFormState {
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const create = async (data: CreateEventRequest, publishNow: boolean): Promise<void> => {
    setSaving(true)
    setError(null)
    try {
      const event = await createEvent(data)
      if (publishNow) {
        await publishEvent(event.id)
      }
      const logAttributes = {
        category: event.category,
        visibility: event.visibility,
        status: publishNow ? 'PUBLISHED' : event.status,
      }
      posthog.capture('event_created', logAttributes)
      eventLifecycleLogger.created(logAttributes)
      navigate(`/events/${event.id}`)
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : 'Erro ao criar evento')
    } finally {
      setSaving(false)
    }
  }

  const update = async (id: string, data: UpdateEventRequest): Promise<EventResponse | void> => {
    setSaving(true)
    setError(null)
    try {
      const event = await updateEvent(id, data)
      const logAttributes = {
        category: event.category,
        visibility: event.visibility,
        status: event.status,
      }
      posthog.capture('event_updated', logAttributes)
      eventLifecycleLogger.updated(logAttributes)
      navigate(`/events/${id}`)
      return event
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : 'Erro ao salvar alterações')
    } finally {
      setSaving(false)
    }
  }

  const cancelEvent = async (id: string): Promise<void> => {
    setDeleting(true)
    setError(null)
    try {
      await deleteEvent(id)
      posthog.capture('event_cancelled')
      eventLifecycleLogger.cancelled()
      navigate('/events')
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : 'Erro ao cancelar evento')
    } finally {
      setDeleting(false)
    }
  }

  return { saving, deleting, error, create, update, cancelEvent }
}
