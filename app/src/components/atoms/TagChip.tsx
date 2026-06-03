interface TagChipProps {
  label: string
  active?: boolean
  className?: string
}

export default function TagChip({ label, active = false, className = '' }: TagChipProps) {
  return (
    <span
      className={[
        'inline-block px-3 py-1 rounded-full',
        'font-label-caps text-label-caps uppercase',
        active
          ? 'bg-primary-container/10 border border-primary-container/20 text-primary-container'
          : 'bg-white/5 border border-white/10 text-on-surface-variant',
        className,
      ].join(' ')}
    >
      {label}
    </span>
  )
}
