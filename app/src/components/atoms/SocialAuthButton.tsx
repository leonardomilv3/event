interface SocialAuthButtonProps {
  provider: 'google' | 'apple'
  onClick?: () => void
  disabled?: boolean
}

export default function SocialAuthButton({ provider, onClick, disabled = false }: SocialAuthButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={[
        'flex items-center justify-center gap-2',
        'border border-surface-container-highest bg-transparent',
        'py-3 rounded-lg',
        'text-on-surface font-label-md text-label-md',
        'hover:bg-surface-container-high transition-colors',
        disabled ? 'opacity-50 cursor-not-allowed' : '',
      ].join(' ')}
    >
      <span className="material-symbols-outlined text-lg">
        {provider === 'google' ? 'google' : 'apps'}
      </span>
      {provider === 'google' ? 'Google' : 'Apple'}
    </button>
  )
}
