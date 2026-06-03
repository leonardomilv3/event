import GlassPanel from './GlassPanel'

interface TimelineItemProps {
  type: string
  time: string
  content: React.ReactNode
  isActive?: boolean
  className?: string
}

export default function TimelineItem({ type, time, content, isActive = false, className = '' }: TimelineItemProps) {
  return (
    <div className={['relative group', className].join(' ')}>
      {/* Timeline dot */}
      <div className={[
        'absolute -left-[41px] top-1 w-4 h-4 rounded-full ring-4 ring-background z-10 transition-colors',
        isActive ? 'bg-primary-container' : 'bg-outline-variant group-hover:bg-primary-container',
      ].join(' ')} />

      <GlassPanel className={[
        'p-5 border border-white/5 transition-all',
        isActive ? '' : 'group-hover:border-primary-container/20',
      ].join(' ')}>
        <div className="flex items-center gap-3 mb-2">
          <span className={`font-label-caps text-label-caps ${isActive ? 'text-primary-container' : 'text-on-surface-variant'}`}>
            {type}
          </span>
          <span className="text-on-surface-variant text-[12px]">{time}</span>
        </div>
        <div className="font-body-md text-body-md text-on-surface">{content}</div>
      </GlassPanel>
    </div>
  )
}
