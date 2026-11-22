import { useCallback, useEffect, useRef, useState } from 'react'
import type { CalendarCell } from '../../types/calendar'
import type { EventResponse } from '../../types/api'
import CalendarDayCell from '../molecules/CalendarDayCell'
import CalendarWeekdayHeader from '../molecules/CalendarWeekdayHeader'

interface Props {
  cells: CalendarCell[]
  eventsByDay: Map<number, EventResponse[]>
}

const CLOSE_DELAY_MS = 260

function cellKeyOf(cell: CalendarCell): string {
  const d = cell.date
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
}

export default function CalendarGrid({ cells, eventsByDay }: Props) {
  const [openCellKey, setOpenCellKey] = useState<string | null>(null)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const cancelClose = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
  }, [])

  const scheduleClose = useCallback(() => {
    cancelClose()
    closeTimerRef.current = setTimeout(() => setOpenCellKey(null), CLOSE_DELAY_MS)
  }, [cancelClose])

  const openCell = useCallback(
    (key: string) => {
      cancelClose()
      setOpenCellKey(key)
    },
    [cancelClose],
  )

  const closeCell = useCallback(() => {
    cancelClose()
    setOpenCellKey(null)
  }, [cancelClose])

  // Cleanup no unmount (troca de mês remonta o CalendarGrid, mas garante que
  // nenhum timer órfão feche um popover recém-montado).
  useEffect(() => () => cancelClose(), [cancelClose])

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
              onOpen={openCell}
              onScheduleClose={scheduleClose}
              onCancelClose={cancelClose}
              onClose={closeCell}
            />
          )
        })}
      </div>
    </div>
  )
}