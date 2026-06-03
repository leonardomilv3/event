import Icon from '../atoms/Icon'

interface FABProps {
  onClick?: () => void
  label?: string
  icon?: string
  mobileOnly?: boolean
  className?: string
}

export default function FAB({
  onClick,
  label = 'Create Event',
  icon = 'add',
  mobileOnly = false,
  className = '',
}: FABProps) {
  return (
    <button
      onClick={onClick}
      className={[
        'fixed bottom-8 right-8 w-16 h-16 z-50',
        'bg-primary-container text-on-primary-fixed rounded-full',
        'flex items-center justify-center',
        'shadow-mint-glow-xl hover:scale-105 active:scale-95 transition-all',
        'overflow-hidden group',
        mobileOnly ? 'md:hidden' : '',
        className,
      ].join(' ')}
      aria-label={label}
    >
      {/* Shimmer on hover */}
      <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />

      <Icon name={icon} size={26} weight={700} className="relative z-10" />

      {/* Tooltip */}
      {label && (
        <span className="absolute right-[72px] bg-primary-container text-on-primary-fixed px-3 py-1.5 rounded-lg font-bold text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all pointer-events-none shadow-lg">
          {label}
        </span>
      )}
    </button>
  )
}
