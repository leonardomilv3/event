import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import type { CalendarCell } from '../../types/calendar'
import type { EventResponse } from '../../types/api'
import CalendarEventPill from '../atoms/CalendarEventPill'
import CalendarDayPopover from './CalendarDayPopover'

interface Props {
  cell: CalendarCell
  cellKey: string
  events: EventResponse[]
  isOpen: boolean
  onOpen: (key: string) => void
  onScheduleClose: () => void
  onCancelClose: () => void
  onClose: () => void
}

const MAX_VISIBLE = 2

export default function CalendarDayCell({
  cell,
  cellKey,
  events,
  isOpen,
  onOpen,
  onScheduleClose,
  onCancelClose,
  onClose,
}: Props) {
  const { t } = useTranslation('calendar')
  const [isTouch, setIsTouch] = useState(false)
  const cellRef = useRef<HTMLDivElement>(null)
  const popoverId = `calendar-popover-${cellKey}`
  const hasEvents = events.length > 0 && cell.inCurrentMonth
  const visible = events.slice(0, MAX_VISIBLE)
  const remaining = events.length - visible.length

  useEffect(() => {
    setIsTouch(window.matchMedia('(hover: none)').matches)
  }, [])

  // Click/tap fora do popover e da célula → fecha
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node
      if (cellRef.current?.contains(target)) return
      const popover = document.getElementById(popoverId)
      if (popover?.contains(target)) return
      onClose()
    }
    document.addEventListener('mousedown', handler)
    document.addEventListener('touchstart', handler)
    return () => {
      document.removeEventListener('mousedown', handler)
      document.removeEventListener('touchstart', handler)
    }
  }, [isOpen, popoverId, onClose])

  const handleMouseEnter = () => {
    if (!isTouch && hasEvents) onOpen(cellKey)
  }
  const handleMouseLeave = () => {
    if (!isTouch) onScheduleClose()
  }
  const handleClick = () => {
    if (isTouch && hasEvents) {
      if (isOpen) onClose()
      else onOpen(cellKey)
    }
  }
  const handleBlur = () => {
    setTimeout(() => {
      const active = document.activeElement
      if (cellRef.current?.contains(active as Node)) return
      const popover = document.getElementById(popoverId)
      if (popover?.contains(active as Node)) return
      onScheduleClose()
    }, 0)
  }

  return (
    <div
      ref={cellRef}
      className={[
        'relative flex flex-col min-h-[88px] md:min-h-[112px] p-1 md:p-1.5 min-w-0',
        'border-r border-b border-outline-variant/20 transition-colors',
        cell.inCurrentMonth ? 'bg-background' : 'bg-surface-container-lowest/40',
        cell.isToday && 'ring-1 ring-inset ring-primary-container/40 bg-primary-container/[0.04]',
        hasEvents && 'cursor-pointer hover:bg-surface-container/50',
      ]
        .filter(Boolean)
        .join(' ')}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      onFocus={() => hasEvents && onOpen(cellKey)}
      onBlur={handleBlur}
      onKeyDown={(e) => {
        if (!hasEvents) return
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          if (isOpen) onClose()
          else onOpen(cellKey)
        }
        if (e.key === 'Escape' && isOpen) onClose()
      }}
      role={hasEvents ? 'button' : undefined}
      tabIndex={hasEvents ? 0 : undefined}
      aria-haspopup={hasEvents ? 'dialog' : undefined}
      aria-expanded={hasEvents ? isOpen : undefined}
      aria-controls={hasEvents ? popoverId : undefined}
      aria-label={
        hasEvents ? `${cell.dayOfMonth} — ${t('eventsCount', { count: events.length })}` : undefined
      }
    >
      <div className="flex items-center justify-between mb-0.5">
        <span
          className={[
            'font-label-md text-[11px] md:text-label-md leading-none',
            cell.inCurrentMonth ? 'text-on-surface' : 'text-on-surface-variant/50',
            cell.isToday &&
                'bg-primary-container text-on-primary-container font-bold w-5 h-5 md:w-6 md:h-6 flex items-center justify-center rounded-full',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {cell.dayOfMonth}
        </span>
      </div>

      <div className="flex flex-col gap-0.5 overflow-hidden">
        {visible.map((ev) => (
          <CalendarEventPill key={ev.id} event={ev} variant="full" />
        ))}
        {remaining > 0 && (
          <span className="text-[9px] md:text-[10px] text-on-surface-variant/80 pl-1 font-label-md">
            {t('moreEvents', { count: remaining })}
          </span>
        )}
      </div>

      {isOpen &&
        hasEvents &&
        createPortal(
          <CalendarDayPopover
            cell={cell}
            events={events}
            anchorRef={cellRef}
            popoverId={popoverId}
            onClose={onClose}
            onMouseEnter={onCancelClose}
            onMouseLeave={onScheduleClose}
          />,
          document.body,
        )}
    </div>
  )
}