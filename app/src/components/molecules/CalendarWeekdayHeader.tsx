import { useTranslation } from 'react-i18next'

const WEEKDAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const

export default function CalendarWeekdayHeader() {
  const { t } = useTranslation('calendar')
  return (
    <div className="grid grid-cols-7 border-b border-outline-variant/30 bg-surface-container/40">
      {WEEKDAYS.map((key) => (
        <div
          key={key}
          className="py-2 text-center font-label-caps text-[10px] md:text-[11px] uppercase tracking-widest text-on-surface-variant"
        >
          {t(`weekdays.${key}`)}
        </div>
      ))}
    </div>
  )
}