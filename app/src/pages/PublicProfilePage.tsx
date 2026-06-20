import { useState } from 'react'
import { useParams } from 'react-router-dom'
import TopNavBar from '../components/organisms/TopNavBar'
import Footer from '../components/organisms/Footer'
import FollowButton from '../components/atoms/FollowButton'
import TagChip from '../components/atoms/TagChip'
import Icon from '../components/atoms/Icon'
import FollowListModal from '../components/molecules/FollowListModal'
import { usePublicProfile } from '../hooks/usePublicProfile'
import { useFollow } from '../hooks/useFollow'
import { useAuthContext } from '../hooks/useAuthContext'

const BANNER_FALLBACK = 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1400&q=80'
const AVATAR_FALLBACK = 'https://i.pravatar.cc/160?img=8'

export default function PublicProfilePage() {
  const { userId = '' } = useParams<{ userId: string }>()
  const { user } = useAuthContext()

  const { profile, loading, error } = usePublicProfile(userId)
  const { followers, following, isFollowing, actionLoading, toggleFollow } = useFollow(userId)

  const [modal, setModal] = useState<'followers' | 'following' | null>(null)

  const isOwnProfile = user !== null && user.id === userId

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <TopNavBar
        authenticated={user !== null}
        userName={user?.username ?? ''}
      />

      {/* Loading */}
      {loading && (
        <div className="min-h-screen pt-20 flex items-center justify-center">
          <Icon name="progress_activity" size={40} className="animate-spin text-primary-container" />
        </div>
      )}

      {/* Error */}
      {!loading && (error || !profile) && (
        <div className="min-h-screen pt-20 flex flex-col items-center justify-center gap-stack-md">
          <Icon name="person_off" size={48} className="text-on-surface-variant" />
          <p className="font-sans text-body-lg text-on-surface-variant">
            {error ?? 'Perfil não encontrado'}
          </p>
        </div>
      )}

      {/* Content */}
      {!loading && !error && profile && (
        <main className="pt-0 pb-stack-xl">

          {/* Hero Banner */}
          <section className="relative h-[360px] md:h-[460px] w-full overflow-hidden">
            <img
              src={BANNER_FALLBACK}
              alt="Banner"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          </section>

          {/* Profile info — overlaps hero bottom */}
          <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop -mt-28 md:-mt-36 relative z-10">
            <div className="flex flex-col md:flex-row items-end gap-stack-md md:gap-gutter mb-stack-xl">

              {/* Avatar */}
              <div className="w-36 h-36 md:w-48 md:h-48 rounded-xl overflow-hidden glass-panel p-1 flex-shrink-0 shadow-mint-glow">
                <img
                  src={profile.avatarUrl ?? AVATAR_FALLBACK}
                  alt={profile.displayName ?? profile.username}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>

              {/* Info + actions */}
              <div className="flex-1 w-full flex flex-col md:flex-row justify-between items-start md:items-end gap-stack-md pb-base">
                <div className="space-y-stack-xs">
                  <h1 className="font-serif text-headline-lg-mobile md:text-headline-lg text-on-surface">
                    {profile.displayName ?? profile.username}
                  </h1>
                  <p className="font-sans text-body-md text-on-surface-variant">
                    @{profile.username}
                  </p>
                  {profile.city && (
                    <div className="flex items-center gap-stack-xs text-primary-container">
                      <Icon name="location_on" size={16} />
                      <span className="font-label-md text-label-md">{profile.city}</span>
                    </div>
                  )}
                </div>

                {/* Follow action + counts */}
                <div className="flex flex-wrap items-center gap-stack-md">
                  <div className="flex gap-stack-md font-sans text-body-md">
                    <button
                      type="button"
                      onClick={() => setModal('followers')}
                      className="hover:text-primary-container transition-colors"
                    >
                      <strong>{followers.length}</strong>{' '}
                      <span className="text-on-surface-variant">Seguidores</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setModal('following')}
                      className="hover:text-primary-container transition-colors"
                    >
                      <strong>{following.length}</strong>{' '}
                      <span className="text-on-surface-variant">Seguindo</span>
                    </button>
                  </div>

                  {user !== null && !isOwnProfile && (
                    <FollowButton
                      isFollowing={isFollowing}
                      onClick={() => void toggleFollow()}
                      loading={actionLoading}
                      size="md"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Bio & Interests */}
            <div className="max-w-2xl space-y-stack-md">
              {profile.bio && (
                <div className="space-y-stack-xs">
                  <h2 className="font-label-caps text-label-caps text-on-surface-variant uppercase">
                    Biografia
                  </h2>
                  <p className="font-sans text-body-lg text-on-surface leading-relaxed">
                    {profile.bio}
                  </p>
                </div>
              )}

              {profile.interests && profile.interests.length > 0 && (
                <div className="flex flex-wrap gap-stack-sm pt-stack-xs">
                  {profile.interests.map((tag) => (
                    <TagChip key={tag} label={tag} active />
                  ))}
                </div>
              )}
            </div>
          </section>

        </main>
      )}

      <Footer />

      {/* Follow list modals */}
      {modal === 'followers' && (
        <FollowListModal
          title="Seguidores"
          users={followers}
          mode="followers"
          onClose={() => setModal(null)}
          currentUserId={user?.id}
        />
      )}
      {modal === 'following' && (
        <FollowListModal
          title="Seguindo"
          users={following}
          mode="following"
          onClose={() => setModal(null)}
          currentUserId={user?.id}
        />
      )}
    </div>
  )
}
