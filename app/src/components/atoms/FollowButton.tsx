import Icon from './Icon'

interface FollowButtonProps {
  isFollowing: boolean
  onClick: () => void
  loading?: boolean
  size?: 'sm' | 'md'
}

export default function FollowButton({ isFollowing, onClick, loading = false, size = 'md' }: FollowButtonProps) {
  const padding = size === 'sm' ? 'px-4 py-1.5' : 'px-8 py-2.5'
  const text = size === 'sm' ? 'text-label-md font-label-md' : 'font-bold'

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      aria-label={loading ? (isFollowing ? 'Deixando de seguir...' : 'Seguindo...') : undefined}
      className={[
        'flex items-center justify-center gap-2 rounded-full border-2 transition-all active:scale-95',
        padding,
        text,
        isFollowing
          ? 'bg-primary-container border-primary-container text-on-primary'
          : 'bg-transparent border-primary-container text-primary-container hover:bg-primary-container/10',
        loading ? 'opacity-60 cursor-not-allowed' : '',
      ].join(' ')}
    >
      {loading ? (
        <Icon name="progress_activity" size={size === 'sm' ? 16 : 18} className="animate-spin" />
      ) : (
        <>
          {isFollowing && <Icon name="check" size={size === 'sm' ? 14 : 16} />}
          {isFollowing ? 'Seguindo' : 'Seguir'}
        </>
      )}
    </button>
  )
}
