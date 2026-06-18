import { useState, useEffect } from 'react'
import { type UserProfile } from '../types/api'
import { useAuthContext } from './useAuthContext'
import { updateMe, type UpdateProfileRequest } from '../services/userService'
import { ApiError } from '../services/httpClient'

export interface ProfileState {
  profile: UserProfile | null
  update: (data: UpdateProfileRequest) => Promise<void>
  updating: boolean
  error: string | null
  success: boolean
  logout: () => void
}

export function useProfile(): ProfileState {
  const { user, refreshUser, logout } = useAuthContext()
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!success) return
    const timer = setTimeout(() => setSuccess(false), 3000)
    return () => clearTimeout(timer)
  }, [success])

  const update = async (data: UpdateProfileRequest): Promise<void> => {
    setUpdating(true)
    setError(null)
    setSuccess(false)
    try {
      await updateMe(data)
      await refreshUser()
      setSuccess(true)
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : 'Erro ao atualizar perfil')
    } finally {
      setUpdating(false)
    }
  }

  return { profile: user, update, updating, error, success, logout }
}
