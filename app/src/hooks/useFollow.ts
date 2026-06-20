import { useState, useEffect } from 'react'
import { type FollowDto } from '../types/api'
import { getFollowers, getFollowing, follow as followService, unfollow as unfollowService } from '../services/socialService'
import { useAuthContext } from './useAuthContext'
import { ApiError } from '../services/httpClient'

export interface UseFollowReturn {
  followers: FollowDto[]
  following: FollowDto[]
  isFollowing: boolean
  loading: boolean
  actionLoading: boolean
  error: string | null
  toggleFollow: () => Promise<void>
  refresh: () => void
}

export function useFollow(profileUserId: string): UseFollowReturn {
  const { user } = useAuthContext()
  const [followers, setFollowers] = useState<FollowDto[]>([])
  const [following, setFollowing] = useState<FollowDto[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  useEffect(() => {
    if (!profileUserId) return
    let cancelled = false
    void Promise.resolve()
      .then(() => {
        if (cancelled) return
        setFollowers([])
        setFollowing([])
        setError(null)
        setLoading(true)
        return Promise.all([getFollowers(profileUserId), getFollowing(profileUserId)])
          .then(([followersList, followingList]) => {
            if (!cancelled) {
              setFollowers(followersList)
              setFollowing(followingList)
            }
          })
          .catch((err: unknown) => {
            if (!cancelled) setError(err instanceof ApiError ? err.message : 'Erro ao carregar conexões')
          })
          .finally(() => {
            if (!cancelled) setLoading(false)
          })
      })
    return () => { cancelled = true }
  }, [profileUserId, refreshTrigger])

  const isFollowing = user !== null && followers.some((f) => f.follower.id === user.id)

  const toggleFollow = async (): Promise<void> => {
    if (!user) return
    setActionLoading(true)
    setError(null)
    try {
      if (isFollowing) {
        await unfollowService(profileUserId)
      } else {
        await followService(profileUserId)
      }
      setRefreshTrigger((n) => n + 1)
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : 'Erro ao atualizar conexão')
    } finally {
      setActionLoading(false)
    }
  }

  const refresh = () => setRefreshTrigger((n) => n + 1)

  return { followers, following, isFollowing, loading, actionLoading, error, toggleFollow, refresh }
}
