import { useCallback, useEffect, useRef, useState } from 'react'
import type { CalendarCell } from '../../types/calendar'
import type { EventResponse } from '../../types/api'
import CalendarDayCell from '../molecules/CalendarDayCell'
import CalendarWeekdayHeader from '../molecules/CalendarWeekdayHeader'

interface Props {
  cells: CalendarCell[]
  eventsByDay: Map<number, EventResponse[]>
  onSeeAll: (date: Date) => void
}

const OPEN_DELAY_MS = 200
const CLOSE_DELAY_MS = 300

function cellKeyOf(cell: CalendarCell): string {
  const d = cell.date
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
}

export default function CalendarGrid({ cells, eventsByDay, onSeeAll }: Props) {
  const [openCellKey, setOpenCellKey] = useState<string | null>(null)
  const openCellRef = useRef<string | null>(null)
  const openTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const setOpen = useCallback((key: string | null) => {
    openCellRef.current = key
    setOpenCellKey(key)
  }, [])

  const clearOpenTimer = useCallback(() => {
    if (openTimerRef.current) {
      clearTimeout(openTimerRef.current)
      openTimerRef.current = null
    }
  }, [])

  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
  }, [])

  const requestOpen = useCallback(
    (key: string) => {
      clearCloseTimer()
      if (openCellRef.current === key) {
        clearOpenTimer()
        return
      }
      clearOpenTimer()
      openTimerRef.current = setTimeout(() => {
        setOpen(key)
        openTimerRef.current = null
      }, OPEN_DELAY_MS)
    },
    [clearCloseTimer, clearOpenTimer, setOpen],
  )

  const requestClose = useCallback(() => {
    clearOpenTimer()
    clearCloseTimer()
    closeTimerRef.current = setTimeout(() => {
      setOpen(null)
      closeTimerRef.current = null
    }, CLOSE_DELAY_MS)
  }, [clearOpenTimer, clearCloseTimer, setOpen])

  const cancelClose = useCallback(() => {
    clearCloseTimer()
  }, [clearCloseTimer])

  const forceClose = useCallback(() => {
    clearOpenTimer()
    clearCloseTimer()
    setOpen(null)
  }, [clearOpenTimer, clearCloseTimer, setOpen])

  const toggleCell = useCallback(
    (key: string) => {
      clearOpenTimer()
      clearCloseTimer()
      setOpen(openCellRef.current === key ? null : key)
    },
    [clearOpenTimer, clearCloseTimer, setOpen],
  )

  useEffect(
    () => () => {
      clearOpenTimer()
      clearCloseTimer()
    },
    [clearOpenTimer, clearCloseTimer],
  )

  return (
    <div className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest relative">
      <div className="rounded-t-xl overflow-hidden">
        <CalendarWeekdayHeader />
      </div>
      <div className="grid grid-cols-7">
        {cells.map((cell, index) => {
          const events = cell.inCurrentMonth ? eventsByDay.get(cell.dayOfMonth) ?? [] : []
          const key = cellKeyOf(cell)
          return (
            <CalendarDayCell
              key={`${key}-${index}`}
              cell={cell}
              cellKey={key}
              events={events}
              isOpen={openCellKey === key}
              openCellKey={openCellKey}
              onEnter={requestOpen}
              onLeave={requestClose}
              onCancelClose={cancelClose}
              onForceClose={forceClose}
              onToggle={toggleCell}
              onSeeAll={onSeeAll}
            />
          )
        })}
      </div>
    </div>
  )
}