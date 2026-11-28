import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { CalendarCell } from '../../types/calendar'
import type { EventResponse } from '../../types/api'
import { formatEventTimeRange, formatLongDate } from '../../utils/calendar'
import Icon from '../atoms/Icon'

interface Props {
  cell: CalendarCell
  events: EventResponse[]
  anchorRef: React.RefObject<HTMLElement | null>
  popoverId: string
  onClose: () => void
  onMouseEnter?: () => void
  onMouseLeave?: () => void
  onSeeAll: (date: Date) => void
}

const PREFERRED_WIDTH = 300
const GAP = 6
const VIEWPORT_PADDING = 12
const ESTIMATED_ROW = 48
const ESTIMATED_HEADER = 80
const ESTIMATED_BUTTON = 40
const MAX_POPOVER_EVENTS = 5
const MAX_CONTENT_HEIGHT = 360

interface Layout {
  wrapperStyle: React.CSSProperties
  maxContentHeight: number
  flipped: boolean
}

export default function CalendarDayPopover({
  cell,
  events,
  anchorRef,
  popoverId,
  onClose,
  onMouseEnter,
  onMouseLeave,
  onSeeAll,
}: Props) {
  const { t, i18n } = useTranslation('calendar')
  const popoverRef = useRef<HTMLDivElement>(null)
  const [layout, setLayout] = useState<Layout | null>(null)

  const visible = events.slice(0, MAX_POPOVER_EVENTS)
  const hasOverflow = events.length > MAX_POPOVER_EVENTS

  useLayoutEffect(() => {
    const anchor = anchorRef.current
    if (!anchor) return

    const rect = anchor.getBoundingClientRect()
    const vw = window.innerWidth
    const vh = window.innerHeight

    const width = Math.min(PREFERRED_WIDTH, vw - 2 * VIEWPORT_PADDING)
    let left = rect.left + rect.width / 2 - width / 2
    left = Math.max(VIEWPORT_PADDING, Math.min(left, vw - width - VIEWPORT_PADDING))

    const estimatedContent =
      visible.length * ESTIMATED_ROW + ESTIMATED_HEADER + ESTIMATED_BUTTON
    const availableBelow = vh - rect.bottom - VIEWPORT_PADDING - GAP
    const availableAbove = rect.top - VIEWPORT_PADDING - GAP
    const flipUp =
      availableBelow < Math.min(estimatedContent, MAX_CONTENT_HEIGHT) &&
      availableAbove > availableBelow

    const availableHeight = Math.max(80, flipUp ? availableAbove : availableBelow)
    const maxContentHeight = Math.min(estimatedContent, MAX_CONTENT_HEIGHT, availableHeight)

    const wrapperStyle: React.CSSProperties = flipUp
      ? { position: 'fixed', bottom: vh - rect.top, left, width, paddingBottom: GAP }
      : { position: 'fixed', top: rect.bottom, left, width, paddingTop: GAP }

    setLayout({ wrapperStyle, maxContentHeight, flipped: flipUp })
  }, [anchorRef, visible.length])

  useEffect(() => {
    if (!layout) return
    const handler = (e: Event) => {
      const popover = popoverRef.current
      if (popover && e.target instanceof Node && popover.contains(e.target)) return
      onClose()
    }
    window.addEventListener('scroll', handler, true)
    window.addEventListener('resize', handler)
    return () => {
      window.removeEventListener('scroll', handler, true)
      window.removeEventListener('resize', handler)
    }
  }, [layout, onClose])

  // FIX: se a saída do popover vai em direção a uma célula do calendário,
  // não fechar — o `requestOpen` da célula de destino cancela o close timer.
  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const related = e.relatedTarget as HTMLElement | null
    if (related?.hasAttribute?.('data-calendar-cell')) {
      onMouseLeave?.()
      return
    }
    onMouseLeave?.()
  }

  if (!layout) return null

  const longDate = formatLongDate(cell.date, i18n.language)

  return (
    <div
      ref={popoverRef}
      id={popoverId}
      role="dialog"
      aria-label={longDate}
      onMouseEnter={onMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={layout.wrapperStyle}
      className={['calendar-pop z-[100]', layout.flipped ? 'origin-bottom' : 'origin-top'].join(' ')}
    >
      <div
        className="rounded-xl border border-outline-variant/40 bg-surface-container/95 backdrop-blur-xl shadow-2xl p-3 flex flex-col overflow-hidden"
        style={{ maxHeight: layout.maxContentHeight }}
      >
        <div className="flex items-start justify-between gap-2 mb-2 pb-2 border-b border-outline-variant/30 shrink-0">
          <div className="min-w-0">
            <p className="font-label-caps text-[10px] text-primary-container uppercase tracking-widest">
              {t('eventsCount', { count: events.length })}
            </p>
            <p className="font-serif text-body-md text-on-surface leading-tight capitalize truncate">
              {longDate}
            </p>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onClose()
            }}
            className="shrink-0 text-on-surface-variant hover:text-on-surface p-1 rounded-full hover:bg-white/5"
            aria-label={t('tooltips.close')}
            title={t('tooltips.close')}
          >
            <Icon name="close" size={14} />
          </button>
        </div>

        <ul className="flex flex-col gap-0.5 overflow-y-auto overflow-x-hidden min-h-0 flex-1">
          {visible.map((ev) => {
            const { start, end } = formatEventTimeRange(ev.startsAt, ev.endsAt, i18n.language)
            const label = end ? `${start} - ${end} · ${ev.title}` : `${start} · ${ev.title}`
            return (
              <li key={ev.id}>
                <Link
                  to={`/events/${ev.id}`}
                  title={label}
                  className="flex items-start py-1.5 pl-4 -mx-1.5 rounded-lg hover:bg-white/5 transition-colors group"
                >
                  <span className="font-mono text-[11px] font-bold text-primary-container shrink-0 w-20 pt-0.5">
                    {start}
                    {end && <span className="text-on-surface-variant"> {end}</span>}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-sans text-label-md text-on-surface truncate group-hover:text-primary-container transition-colors">
                      {ev.title}
                    </p>
                    {ev.locationName && (
                      <p className="font-sans text-[10px] text-on-surface-variant flex items-center gap-1 mt-0.5">
                        <Icon name="location_on" size={10} />
                        <span className="truncate">{ev.locationName}</span>
                      </p>
                    )}
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onSeeAll(cell.date)
          }}
          title={t('tooltips.seeOnList')}
          className="shrink-0 mt-2 pt-2 border-t border-outline-variant/30 flex items-center justify-between gap-2 text-primary-container font-label-md text-label-md hover:text-primary-fixed transition-colors"
        >
          <span>
            {t('seeOnList')}
            {hasOverflow && (
              <span className="text-on-surface-variant ml-1">({events.length})</span>
            )}
          </span>
          <Icon name="arrow_forward" size={16} />
        </button>
      </div>
    </div>
  )
}