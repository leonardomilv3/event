import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { EventResponse } from '../../types/api'
import Icon from '../atoms/Icon'
import { formatEventTimeRange, formatLongDate } from '../../utils/calendar'

interface Props {
  eventsByDay: Map<number, EventResponse[]>
  year: number
  month: number
  highlightDay?: number | null
}

export default function EventsListView({ eventsByDay, year, month, highlightDay }: Props) {
  const { t, i18n } = useTranslation('calendar')
  const days = Array.from(eventsByDay.keys()).sort((a, b) => a - b)

  if (days.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-stack-xl text-center">
        <div className="relative mb-stack-lg">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-48 h-48 bg-primary-container/5 rounded-full blur-3xl" />
          </div>
          <div className="relative w-32 h-32 flex items-center justify-center">
            <div className="pulse-ring" />
            <div className="relative z-10 w-24 h-24 rounded-full bg-surface-container border border-white/10 glass-panel flex items-center justify-center">
              <Icon name="event_available" size={48} className="text-primary-container" />
            </div>
          </div>
        </div>
        <p className="font-body-lg text-body-lg text-on-surface mb-stack-sm">{t('empty')}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      {days.map((day) => {
        const dayDate = new Date(year, month, day)
        const events = eventsByDay.get(day)!
        const isHighlighted = highlightDay === day
        return (
          <section
            key={day}
            id={`list-day-${year}-${month}-${day}`}
            className={[
              'flex flex-col gap-2 scroll-mt-24 rounded-xl transition-all duration-300',
              isHighlighted ? 'ring-2 ring-primary-container/60 bg-primary-container/[0.04] p-3 -m-3' : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <h2 className="font-serif text-body-lg text-primary-container capitalize">
              {formatLongDate(dayDate, i18n.language)}
            </h2>
            <ul className="flex flex-col gap-1">
              {events.map((ev) => {
                const { start, end } = formatEventTimeRange(ev.startsAt, ev.endsAt, i18n.language)
                return (
                  <li key={ev.id}>
                    <Link
                      to={`/events/${ev.id}`}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg bg-surface-container border border-outline-variant/20 hover:border-primary-container/40 hover:bg-surface-container-high transition-all group"
                    >
                      <div className="flex flex-col shrink-0 w-[68px] md:w-20">
                        <span className="font-mono text-[12px] md:text-[13px] font-bold text-primary-container leading-tight">
                          {start}
                        </span>
                        {end && (
                          <span className="font-mono text-[10px] md:text-[11px] text-on-surface-variant leading-tight">
                            {end}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-sans text-body-md font-semibold text-on-surface group-hover:text-primary-container transition-colors truncate">
                          {ev.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-3 mt-0.5">
                          {ev.locationName && (
                            <span className="font-sans text-[11px] text-on-surface-variant flex items-center gap-1 min-w-0">
                              <Icon name="location_on" size={12} className="shrink-0" />
                              <span className="truncate">{ev.locationName}</span>
                            </span>
                          )}
                          <span className="font-sans text-[11px] text-on-surface-variant flex items-center gap-1 shrink-0">
                            <Icon name="group" size={12} />
                            {ev.participantCount}
                          </span>
                        </div>
                      </div>
                      <Icon
                        name="chevron_right"
                        size={18}
                        className="text-on-surface-variant group-hover:text-primary-container transition-colors shrink-0"
                      />
                    </Link>
                  </li>
                )
              })}
            </ul>
          </section>
        )
      })}
    </div>
  )
}