import { useEffect } from 'react'
import GlassPanel from './GlassPanel'
import Icon from '../atoms/Icon'
import { type FollowDto, type UserDto } from '../../types/api'

interface FollowListModalProps {
  title: string
  users: FollowDto[]
  mode: 'followers' | 'following'
  onClose: () => void
  currentUserId?: string
}

function UserAvatar({ user }: { user: UserDto }) {
  return (
    <div className="w-12 h-12 rounded-full bg-surface-container-high border border-outline-variant flex items-center justify-center flex-shrink-0">
      <span className="font-bold text-label-md text-primary-container uppercase select-none">
        {user.username.slice(0, 2)}
      </span>
    </div>
  )
}

export default function FollowListModal({
  title,
  users,
  mode,
  onClose,
}: FollowListModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-stack-md">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <GlassPanel className="relative w-full max-w-md rounded-xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center px-gutter py-stack-md border-b border-white/5">
          <h2 className="font-serif text-headline-md text-on-surface">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
            aria-label="Fechar"
          >
            <Icon name="close" size={20} className="text-on-surface-variant" />
          </button>
        </div>

        {/* List */}
        <ul className="max-h-[480px] overflow-y-auto divide-y divide-white/5">
          {users.length === 0 && (
            <li className="flex items-center justify-center py-stack-xl text-on-surface-variant font-label-md text-label-md">
              Nenhum usuário encontrado.
            </li>
          )}
          {users.map((dto) => {
            const userToShow: UserDto = mode === 'followers' ? dto.follower : dto.following
            return (
              <li
                key={dto.id}
                className="flex items-center gap-stack-md p-stack-md hover:bg-white/5 transition-colors"
              >
                <UserAvatar user={userToShow} />
                <div className="overflow-hidden">
                  <p className="font-bold font-sans text-on-surface truncate">{userToShow.username}</p>
                  <p className="font-sans text-body-md text-on-surface-variant truncate lowercase">
                    @{userToShow.username}
                  </p>
                </div>
              </li>
            )
          })}
        </ul>

        {/* Footer */}
        {users.length > 0 && (
          <div className="px-gutter py-stack-sm border-t border-white/5 text-center">
            <p className="font-label-caps text-label-caps text-on-surface-variant">
              {users.length} {mode === 'followers' ? 'seguidores' : 'seguindo'}
            </p>
          </div>
        )}
      </GlassPanel>
    </div>
  )
}
