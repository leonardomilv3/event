import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import TopNavBar from '../components/organisms/TopNavBar'
import SideNavBar from '../components/organisms/SideNavBar'
import BottomNav from '../components/organisms/BottomNav'
import Footer from '../components/organisms/Footer'
import Icon from '../components/atoms/Icon'
import ViewToggle from '../components/atoms/ViewToggle'
import CalendarMonthNavigator from '../components/molecules/CalendarMonthNavigator'
import CalendarGrid from '../components/organisms/CalendarGrid'
import EventsListView from '../components/organisms/EventsListView'
import { useMonthEvents } from '../hooks/useMonthEvents'
import { buildMonthGrid, formatMonthLabel } from '../utils/calendar'

type ViewMode = 'list' | 'calendar'
type Direction = 'next' | 'prev' | null

export default function MyEventsPage() {
  const { t, i18n } = useTranslation('events')
  const { t: tCalendar } = useTranslation('calendar')
  const [today] = useState(() => new Date())
  const [view, setView] = useState<ViewMode>('calendar')
  const [direction, setDirection] = useState<Direction>(null)
  const [cursor, setCursor] = useState({
    year: today.getFullYear(),
    month: today.getMonth(),
  })
  const [highlightDay, setHighlightDay] = useState<number | null>(null)
  const pendingScrollRef = useRef<string | null>(null)

  const { eventsByDay, loading, error } = useMonthEvents(cursor.year, cursor.month)
  const cells = useMemo(() => buildMonthGrid(cursor.year, cursor.month), [cursor])
  const monthLabel = formatMonthLabel(cursor.year, cursor.month, i18n.language)
  const monthKey = `${cursor.year}-${cursor.month}`

  const go = useCallback((delta: number) => {
    setDirection(delta > 0 ? 'next' : 'prev')
    setCursor((prev) => {
      const d = new Date(prev.year, prev.month + delta, 1)
      return { year: d.getFullYear(), month: d.getMonth() }
    })
  }, [])

  const goToday = useCallback(() => {
    setDirection(null)
    setCursor({ year: today.getFullYear(), month: today.getMonth() })
  }, [today])

  const jumpTo = useCallback((year: number, month: number) => {
    setDirection(null)
    setCursor({ year, month })
  }, [])

  const handleSeeAll = useCallback((date: Date) => {
    pendingScrollRef.current = `list-day-${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
    setHighlightDay(date.getDate())
    setView('list')
    if (cursor.year !== date.getFullYear() || cursor.month !== date.getMonth()) {
      setCursor({ year: date.getFullYear(), month: date.getMonth() })
    }
  }, [cursor.year, cursor.month])

  useEffect(() => {
    if (view !== 'list' || !pendingScrollRef.current) return
    const id = pendingScrollRef.current
    pendingScrollRef.current = null
    requestAnimationFrame(() => {
      const el = document.getElementById(id)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
    const t = setTimeout(() => setHighlightDay(null), 2500)
    return () => clearTimeout(t)
  }, [view, monthKey])

  const animationClass =
    direction === 'next'
      ? 'calendar-enter-right'
      : direction === 'prev'
        ? 'calendar-enter-left'
        : ''

  const viewOptions = [
    {
      value: 'list',
      label: tCalendar('views.list'),
      icon: 'list',
      tooltip: tCalendar('tooltips.viewList'),
    },
    {
      value: 'calendar',
      label: tCalendar('views.calendar'),
      icon: 'calendar_month',
      tooltip: tCalendar('tooltips.viewCalendar'),
    },
  ]

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <TopNavBar />
      <SideNavBar topOffset="top-20" />
      <div className="flex min-h-screen pt-20">
        <div className="hidden md:block w-64 flex-shrink-0" />
        <main className="flex-1 px-margin-mobile md:px-margin-desktop py-stack-lg max-w-full overflow-x-hidden">
          <header className="mb-stack-lg flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h1 className="font-serif text-headline-lg-mobile md:text-headline-lg text-on-surface mb-2">
                {t('myEvents.title')}
              </h1>
              <p className="font-sans text-body-md text-on-surface-variant">
                {t('myEvents.subtitle')}
              </p>
            </div>
            <ViewToggle
              value={view}
              options={viewOptions}
              onChange={(v) => setView(v as ViewMode)}
            />
          </header>

          <CalendarMonthNavigator
            label={monthLabel}
            year={cursor.year}
            month={cursor.month}
            onPrev={() => go(-1)}
            onNext={() => go(1)}
            onToday={goToday}
            onSelect={jumpTo}
          />

          {loading && (
            <div className="flex items-center justify-center py-stack-xl">
              <Icon
                name="progress_activity"
                size={32}
                className="animate-spin text-primary-container"
              />
              <span className="ml-3 font-label-md text-label-md text-on-surface-variant">
                {tCalendar('loading')}
              </span>
            </div>
          )}

          {!loading && error && (
            <div className="flex items-center justify-center py-stack-xl gap-3">
              <Icon name="error" size={24} className="text-error" />
              <p className="font-label-md text-label-md text-error">{tCalendar('error')}</p>
            </div>
          )}

          {!loading && !error && (
            <div key={monthKey} className={animationClass}>
              {view === 'calendar' ? (
                <CalendarGrid
                  cells={cells}
                  eventsByDay={eventsByDay}
                  onSeeAll={handleSeeAll}
                />
              ) : (
                <EventsListView
                  eventsByDay={eventsByDay}
                  year={cursor.year}
                  month={cursor.month}
                  highlightDay={highlightDay}
                />
              )}
            </div>
          )}
        </main>
      </div>
      <Footer />
      <BottomNav />
    </div>
  )
}