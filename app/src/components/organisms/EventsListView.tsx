import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { EventResponse } from '../../types/api'
import Icon from '../atoms/Icon'
import { formatEventTime, formatLongDate } from '../../utils/calendar'

interface Props {
  eventsByDay: Map<number, EventResponse[]>
  year: number
  month: number
}

export default function EventsListView({ eventsByDay, year, month }: Props) {
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
        <p className="font-body-lg text-body-lg text-on-surface mb-stack-sm">
          {t('empty')}
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-stack-lg">
      {days.map((day) => {
        const dayDate = new Date(year, month, day)
        const events = eventsByDay.get(day)!
        return (
          <section key={day} className="flex flex-col gap-stack-sm">
            <h2 className="font-serif text-headline-md text-primary-container capitalize">
              {formatLongDate(dayDate, i18n.language)}
            </h2>
            <ul className="flex flex-col gap-2">
              {events.map((ev) => (
                <li key={ev.id}>
                  <Link
                    to={`/events/${ev.id}`}
                    className="flex items-start md:items-center gap-stack-md p-stack-md rounded-lg bg-surface-container border border-outline-variant/20 hover:border-primary-container/40 hover:bg-surface-container-high transition-all group"
                  >
                    <div className="flex flex-col items-center shrink-0 w-14 md:w-16">
                      <span className="font-mono text-label-md md:text-label-lg font-bold text-primary-container">
                        {formatEventTime(ev.startsAt, i18n.language)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-serif text-headline-md text-on-surface group-hover:text-primary-container transition-colors truncate">
                        {ev.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-stack-md mt-1">
                        {ev.locationName && (
                          <span className="font-sans text-label-md text-on-surface-variant flex items-center gap-1">
                            <Icon name="location_on" size={14} />
                            <span className="truncate">{ev.locationName}</span>
                          </span>
                        )}
                        <span className="font-sans text-label-md text-on-surface-variant flex items-center gap-1">
                          <Icon name="group" size={14} />
                          {ev.participantCount}
                        </span>
                      </div>
                    </div>
                    <Icon
                      name="chevron_right"
                      size={20}
                      className="text-on-surface-variant group-hover:text-primary-container transition-colors shrink-0 mt-1 md:mt-0"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )
      })}
    </div>
  )
}