interface ProgressBarProps {
  value: number   // 0–100
  className?: string
}

export default function ProgressBar({ value, className = '' }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value))

  return (
    <div className={['w-full h-1 bg-surface-variant rounded-full overflow-hidden', className].join(' ')}>
      <div
        className="h-full bg-primary-container rounded-full shadow-mint-glow transition-all duration-500"
        style={{ width: `${clamped}%` }}
      />
    </div>
  )
}
