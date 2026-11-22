import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { CalendarCell } from '../../types/calendar'
import type { EventResponse } from '../../types/api'
import { formatEventTime, formatLongDate } from '../../utils/calendar'
import Icon from '../atoms/Icon'

interface Props {
  cell: CalendarCell
  events: EventResponse[]
  anchorRef: React.RefObject<HTMLElement | null>
  popoverId: string
  onClose: () => void
  onMouseEnter?: () => void
  onMouseLeave?: () => void
}

const PREFERRED_WIDTH = 288
const GAP = 6
const VIEWPORT_PADDING = 12
const ESTIMATED_ROW = 56
const ESTIMATED_HEADER = 80
const MAX_CONTENT_HEIGHT = 320

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
}: Props) {
  const { t, i18n } = useTranslation('calendar')
  const popoverRef = useRef<HTMLDivElement>(null)
  const [layout, setLayout] = useState<Layout | null>(null)

  useLayoutEffect(() => {
    const anchor = anchorRef.current
    if (!anchor) return

    const rect = anchor.getBoundingClientRect()
    const vw = window.innerWidth
    const vh = window.innerHeight

    const width = Math.min(PREFERRED_WIDTH, vw - 2 * VIEWPORT_PADDING)
    let left = rect.left + rect.width / 2 - width / 2
    left = Math.max(VIEWPORT_PADDING, Math.min(left, vw - width - VIEWPORT_PADDING))

    const estimatedContent = events.length * ESTIMATED_ROW + ESTIMATED_HEADER
    const availableBelow = vh - rect.bottom - VIEWPORT_PADDING - GAP
    const availableAbove = rect.top - VIEWPORT_PADDING - GAP
    const flipUp = availableBelow < Math.min(estimatedContent, MAX_CONTENT_HEIGHT) && availableAbove > availableBelow

    const availableHeight = Math.max(80, flipUp ? availableAbove : availableBelow)
    const maxContentHeight = Math.min(estimatedContent, MAX_CONTENT_HEIGHT, availableHeight)

    const wrapperStyle: React.CSSProperties = flipUp
      ? {
          position: 'fixed',
          bottom: vh - rect.top, // wrapper's bottom edge aligned with cell top
          left,
          width,
          paddingBottom: GAP, // invisible bridge zone
        }
      : {
          position: 'fixed',
          top: rect.bottom, // wrapper's top edge aligned with cell bottom
          left,
          width,
          paddingTop: GAP, // invisible bridge zone
        }

    setLayout({ wrapperStyle, maxContentHeight, flipped: flipUp })
  }, [anchorRef, events.length])

  // Fecha ao rolar/redimensionar (mas ignora scroll do próprio popover)
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

  if (!layout) return null

  const longDate = formatLongDate(cell.date, i18n.language)

  return (
    <div
      ref={popoverRef}
      id={popoverId}
      role="dialog"
      aria-label={longDate}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={layout.wrapperStyle}
      className={[
        'calendar-pop z-[100]',
        layout.flipped ? 'origin-bottom' : 'origin-top',
      ].join(' ')}
    >
      <div
        className={[
          'rounded-xl border border-outline-variant/40 bg-surface-container/95 backdrop-blur-xl shadow-2xl',
          'p-3 flex flex-col overflow-hidden',
        ].join(' ')}
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
            aria-label={t('actions.close', { ns: 'common' })}
          >
            <Icon name="close" size={14} />
          </button>
        </div>

        <ul className="flex flex-col gap-0.5 overflow-y-auto overflow-x-hidden min-h-0">
          {events.map((ev) => (
            <li key={ev.id}>
              <Link
                to={`/events/${ev.id}`}
                className="flex items-start gap-2 p-1.5 -mx-1.5 rounded-lg hover:bg-white/5 transition-colors group"
              >
                <div className="flex flex-col items-center shrink-0 w-10">
                  <span className="font-mono text-[11px] font-bold text-primary-container">
                    {formatEventTime(ev.startsAt, i18n.language)}
                  </span>
                  <span className="w-px flex-1 bg-outline-variant/30 mt-1" />
                </div>
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
          ))}
        </ul>
      </div>
    </div>
  )
}