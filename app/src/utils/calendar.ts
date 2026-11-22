import type { EventResponse } from '../types/api'
import type { CalendarCell } from '../types/calendar'
import { parseApiDate } from './date'

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

/**
 * Builds a 6-row × 7-col grid (42 cells) starting on Sunday,
 * including leading days from the previous month and trailing days from
 * the next. Always 42 cells to avoid layout shift between months.
 */
export function buildMonthGrid(year: number, month: number): CalendarCell[] {
  const cells: CalendarCell[] = []
  const today = new Date()
  const firstOfMonth = new Date(year, month, 1)
  const leadingDays = firstOfMonth.getDay() // 0 = Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const prevMonthLastDay = new Date(year, month, 0).getDate()

  const push = (date: Date, inCurrentMonth: boolean, dayOfMonth: number) => {
    const index = cells.length
    cells.push({
      date,
      dayOfMonth,
      inCurrentMonth,
      isToday: isSameDay(date, today),
      row: Math.floor(index / 7),
      col: index % 7,
    })
  }

  for (let i = leadingDays; i > 0; i--) {
    const dayNum = prevMonthLastDay - i + 1
    push(new Date(year, month - 1, dayNum), false, dayNum)
  }

  for (let day = 1; day <= daysInMonth; day++) {
    push(new Date(year, month, day), true, day)
  }

  let trailing = 1
  while (cells.length < 42) {
    push(new Date(year, month + 1, trailing), false, trailing)
    trailing++
  }

  return cells
}

export function groupEventsByDay(
  events: EventResponse[],
  year: number,
  month: number,
): Map<number, EventResponse[]> {
  const map = new Map<number, EventResponse[]>()
  for (const event of events) {
    const d = parseApiDate(event.startsAt)
    if (d.getFullYear() === year && d.getMonth() === month) {
      const day = d.getDate()
      const list = map.get(day) ?? []
      list.push(event)
      map.set(day, list)
    }
  }
  for (const list of map.values()) {
    list.sort((a, b) => parseApiDate(a.startsAt).getTime() - parseApiDate(b.startsAt).getTime())
  }
  return map
}

export function formatEventTime(iso: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(parseApiDate(iso))
}

export function formatMonthLabel(year: number, month: number, locale: string): string {
  return new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' })
    .format(new Date(year, month, 1))
    .replace(/^\p{L}/u, (c) => c.toUpperCase())
}

export function formatLongDate(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  })
    .format(date)
    .replace(/^\p{L}/u, (c) => c.toUpperCase())
}