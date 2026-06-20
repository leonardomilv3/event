interface TagChipProps {
  label: string
  active?: boolean
  className?: string
  onClick?: () => void
}

export default function TagChip({ label, active = false, className = '', onClick }: TagChipProps) {
  const classes = [
    'inline-block px-3 py-1 rounded-full',
    'font-label-caps text-label-caps uppercase',
    active
      ? 'bg-primary-container/10 border border-primary-container/20 text-primary-container'
      : 'bg-white/5 border border-white/10 text-on-surface-variant',
    onClick ? 'cursor-pointer transition-colors hover:border-primary-container/40' : '',
    className,
  ].join(' ')

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={classes}>
        {label}
      </button>
    )
  }

  return <span className={classes}>{label}</span>
}
