import GlassPanel from './GlassPanel'

interface AgendaItemProps {
  index: number
  title: string
  time: string
  description?: string
  className?: string
}

export default function AgendaItem({ index, title, time, description, className = '' }: AgendaItemProps) {
  const num = String(index).padStart(2, '0')

  return (
    <GlassPanel className={['p-stack-md flex items-start gap-stack-md group hover:bg-white/5 transition-all', className].join(' ')}>
      <span className="font-serif text-display-lg-mobile text-outline opacity-20 group-hover:opacity-100 transition-opacity leading-none mt-1">
        {num}
      </span>
      <div className="pt-1">
        <h4 className="font-serif text-headline-md text-on-surface">{title}</h4>
        <p className="font-label-md text-label-md text-on-surface-variant mt-1">{time}</p>
        {description && (
          <p className="font-body-md text-body-md text-on-surface-variant mt-2">{description}</p>
        )}
      </div>
    </GlassPanel>
  )
}
