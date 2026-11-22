import { useTranslation } from 'react-i18next'
import type { EventResponse } from '../../types/api'
import { formatEventTime } from '../../utils/calendar'

interface Props {
  event: EventResponse
  variant?: 'compact' | 'full'
}

const STATUS_STYLE: Record<string, string> = {
  PUBLISHED: 'border-l-primary-container bg-primary-container/10 text-primary-container',
  DRAFT: 'border-l-outline bg-surface-container-high/60 text-on-surface-variant',
  CANCELLED: 'border-l-error bg-error/10 text-error opacity-70',
  FINISHED: 'border-l-outline bg-surface-container-high/40 text-on-surface-variant/70',
}

export default function CalendarEventPill({ event, variant = 'full' }: Props) {
  const { i18n } = useTranslation()
  const time = formatEventTime(event.startsAt, i18n.language)
  const style = STATUS_STYLE[event.status] ?? STATUS_STYLE.PUBLISHED

  return (
    <div
      className={[
        'flex items-center gap-1 rounded-sm border-l-2 px-1 py-0.5 min-w-0',
        'text-[10px] md:text-[11px] font-label-md leading-tight truncate',
        style,
      ].join(' ')}
      title={`${time} · ${event.title}`}
    >
      <span className="font-mono text-[9px] md:text-[10px] opacity-80 shrink-0">{time}</span>
      {variant === 'full' && <span className="truncate">{event.title}</span>}
    </div>
  )
}