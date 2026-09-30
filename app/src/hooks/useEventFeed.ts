import { useState, useEffect, useReducer } from 'react'
import { type EventResponse } from '../types/api'
import { getFeed } from '../services/eventService'
import { ApiError } from '../services/httpClient'

const BRASILIA_LAT = -15.7942
const BRASILIA_LON = -47.8825
const PAGE_SIZE = 10

interface Location {
  lat: number
  lon: number
}

interface FeedState {
  events: EventResponse[]
  loading: boolean
  error: string | null
  hasMore: boolean
  page: number
}

type FeedAction =
  | { type: 'reset' }
  | { type: 'success'; events: EventResponse[]; hasMore: boolean }
  | { type: 'append'; events: EventResponse[]; hasMore: boolean; page: number }
  | { type: 'error'; message: string }
  | { type: 'loading' }

function feedReducer(state: FeedState, action: FeedAction): FeedState {
  switch (action.type) {
    case 'reset':
      return { events: [], loading: true, error: null, hasMore: false, page: 0 }
    case 'success':
      return { ...state, events: action.events, hasMore: action.hasMore, loading: false, error: null }
    case 'append':
      return { ...state, events: [...state.events, ...action.events], hasMore: action.hasMore, page: action.page, loading: false }
    case 'error':
      return { ...state, error: action.message, loading: false }
    case 'loading':
      return { ...state, loading: true }
    default:
      return state
  }
}

const INITIAL: FeedState = { events: [], loading: true, error: null, hasMore: false, page: 0 }

export interface EventFeedState {
  events: EventResponse[]
  loading: boolean
  error: string | null
  hasMore: boolean
  loadMore: () => Promise<void>
  retry: () => void
}

const roundTo1 = (n: number) => Math.round(n * 10) / 10

export function useEventFeed(): EventFeedState {
  // Inicia com o fallback de Brasília para que o primeiro fetch não espere
  // a resolução do prompt de geolocalização do browser.
  const [location, setLocation] = useState<Location>({ lat: BRASILIA_LAT, lon: BRASILIA_LON })
  const [fetchTrigger, setFetchTrigger] = useState(0)
  const [state, dispatch] = useReducer(feedReducer, INITIAL)

  // Tenta obter localização real com timeout de 3s.
  // Se diferente do fallback na granularidade do cache (~11 km), re-dispara o fetch.
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const realLat = pos.coords.latitude
        const realLon = pos.coords.longitude
        setLocation((prev) => {
          if (roundTo1(realLat) !== roundTo1(prev.lat) || roundTo1(realLon) !== roundTo1(prev.lon)) {
            return { lat: realLat, lon: realLon }
          }
          return prev
        })
      },
      () => {}, // já está no fallback de Brasília, sem ação necessária
      { timeout: 3000, maximumAge: 60000 }
    )
  }, [])

  // Reset and fetch page 0 whenever location resolves or retry is triggered
  useEffect(() => {
    let cancelled = false

    dispatch({ type: 'reset' })

    getFeed(location.lat, location.lon, 0, PAGE_SIZE)
      .then((res) => {
        if (cancelled) return
        dispatch({ type: 'success', events: res.content, hasMore: 0 < res.totalPages - 1 })
      })
      .catch((err: unknown) => {
        if (cancelled) return
        dispatch({ type: 'error', message: err instanceof ApiError ? err.message : 'Erro ao carregar eventos' })
      })

    return () => {
      cancelled = true
    }
  }, [location, fetchTrigger])

  const loadMore = async (): Promise<void> => {
    if (!state.hasMore || state.loading) return
    const nextPage = state.page + 1
    dispatch({ type: 'loading' })
    try {
      const res = await getFeed(location.lat, location.lon, nextPage, PAGE_SIZE)
      dispatch({ type: 'append', events: res.content, hasMore: nextPage < res.totalPages - 1, page: nextPage })
    } catch (err: unknown) {
      dispatch({ type: 'error', message: err instanceof ApiError ? err.message : 'Erro ao carregar mais eventos' })
    }
  }

  const retry = () => setFetchTrigger((n) => n + 1)

  return { events: state.events, loading: state.loading, error: state.error, hasMore: state.hasMore, loadMore, retry }
}
