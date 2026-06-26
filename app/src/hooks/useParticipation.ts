import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { type ParticipantResponse } from '../types/api'
import { join as joinService, leave as leaveService } from '../services/participantService'
import { useAuthContext } from './useAuthContext'
import { ApiError } from '../services/httpClient'

export interface ParticipationState {
  isParticipating: boolean
  countDelta: number
  loading: boolean
  error: string | null
  join: (eventId: string) => Promise<void>
  leave: (eventId: string) => Promise<void>
}

export function useParticipation(participants: ParticipantResponse[]): ParticipationState {
  const { user } = useAuthContext()
  const navigate = useNavigate()

  // null = use participants list; true/false = optimistic override after join/leave
  const [isParticipatingOverride, setIsParticipatingOverride] = useState<boolean | null>(null)
  const [countDelta, setCountDelta] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isParticipating =
    isParticipatingOverride !== null
      ? isParticipatingOverride
      : user !== null && participants.some((p) => p.userId === user.id)

  const join = async (eventId: string): Promise<void> => {
    if (!user) {
      navigate('/login')
      return
    }
    setLoading(true)
    setError(null)
    try {
      await joinService(eventId)
      setIsParticipatingOverride(true)
      setCountDelta((d) => d + 1)
    } catch (err: unknown) {
      if (err instanceof ApiError && err.code === 'ALREADY_PARTICIPANT') {
        // Backend confirma que usuário já é participante — sincronizar UI com essa realidade
        setIsParticipatingOverride(true)
        setError(null)
      } else {
        setError(err instanceof ApiError ? err.message : 'Erro ao participar do evento')
      }
    } finally {
      setLoading(false)
    }
  }

  const leave = async (eventId: string): Promise<void> => {
    if (!user) {
      navigate('/login')
      return
    }
    setLoading(true)
    setError(null)
    try {
      await leaveService(eventId)
      setIsParticipatingOverride(false)
      setCountDelta((d) => d - 1)
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : 'Erro ao sair do evento')
    } finally {
      setLoading(false)
    }
  }

  return { isParticipating, countDelta, loading, error, join, leave }
}
