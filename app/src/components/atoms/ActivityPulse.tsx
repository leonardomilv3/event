interface ActivityPulseProps {
  top?: string
  left?: string
  className?: string
}

/* Floating absolute pulse dot — place inside a relative container */
export default function ActivityPulse({ top, left, className = '' }: ActivityPulseProps) {
  return (
    <div
      className={['activity-pulse', className].join(' ')}
      style={{ top, left }}
    />
  )
}

/* Inline pulse dot — for use inside flex rows (e.g. next to a user name) */
export function PulseDot({ className = '' }: { className?: string }) {
  return <span className={['pulse-dot', className].join(' ')} />
}
