import { useState, useEffect } from 'react'
import { type PublicUserProfile } from '../types/api'
import { getPublicProfile } from '../services/userService'
import { ApiError } from '../services/httpClient'

export interface PublicProfileState {
  profile: PublicUserProfile | null
  loading: boolean
  error: string | null
}

export function usePublicProfile(userId: string): PublicProfileState {
  const [profile, setProfile] = useState<PublicUserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) return
    let cancelled = false
    void Promise.resolve()
      .then(() => {
        if (cancelled) return Promise.resolve<void>(undefined)
        setProfile(null)
        setError(null)
        setLoading(true)
        return getPublicProfile(userId)
          .then((p) => {
            if (!cancelled) setProfile(p)
          })
          .catch((err: unknown) => {
            if (!cancelled) setError(err instanceof ApiError ? err.message : 'Erro ao carregar perfil')
          })
          .finally(() => {
            if (!cancelled) setLoading(false)
          })
      })
    return () => { cancelled = true }
  }, [userId])

  return { profile, loading, error }
}
