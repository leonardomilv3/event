export interface CalendarCell {
  date: Date
  dayOfMonth: number
  inCurrentMonth: boolean
  isToday: boolean
  row: number
  col: number
}

export interface MonthKey {
  year: number
  month: number // 0-indexed (matches JS Date)
}