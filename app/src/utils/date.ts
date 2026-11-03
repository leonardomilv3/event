const MONTHS: Record<string, string[]> = {
  'pt-BR': ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
}
const getMonths = (locale: string): string[] =>
  MONTHS[locale] ?? MONTHS[locale.split('-')[0]] ?? MONTHS['pt-BR']

const pad = (n: number) => String(Math.abs(n)).padStart(2, '0')

export function parseApiDate(value: string): Date {
  return new Date(/[zZ]|[+-]\d{2}:\d{2}$/.test(value) ? value : `${value}Z`)
}

export function apiDateToDatetimeLocal(value: string): string {
  const d = parseApiDate(value)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function datetimeLocalToIso(value: string): string {
  if (!value) return value
  const date = new Date(value)
  const offsetMinutes = -date.getTimezoneOffset()
  const sign = offsetMinutes >= 0 ? '+' : '-'
  const offsetHours = pad(Math.floor(Math.abs(offsetMinutes) / 60))
  const offsetMins = pad(Math.abs(offsetMinutes) % 60)
  const yyyy = date.getFullYear()
  const mm = pad(date.getMonth() + 1)
  const dd = pad(date.getDate())
  const hh = pad(date.getHours())
  const min = pad(date.getMinutes())
  const ss = pad(date.getSeconds())
  return `${yyyy}-${mm}-${dd}T${hh}:${min}:${ss}${sign}${offsetHours}:${offsetMins}`
}

const formatDay = (d: Date, locale: string) => {
  const months = getMonths(locale)
  return `${pad(d.getDate())} ${months[d.getMonth()]}`
}
const formatTime = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`

export function formatEventDate(iso: string, locale = 'pt-BR'): string {
  const d = parseApiDate(iso)
  return `${formatDay(d, locale)}, ${d.getFullYear()} • ${formatTime(d)}`
}

/**
 * Ex.: "17 Set, 2026 • 22:00 até 23:30" (mesmo dia)
 *      "17 Set, 2026 • 22:00 até 18 Set • 02:00" (atravessa meia-noite)
 *
 * `untilWord` vem do i18n (`t('date.until')`), para que "até" / "to" / etc. seja traduzido.
 */
export function formatEventDateRange(
  startsAt: string,
  endsAt: string | null | undefined,
  locale = 'pt-BR',
  untilWord = 'até',
): string {
  const start = formatEventDate(startsAt, locale)
  if (!endsAt) return start
  const s = parseApiDate(startsAt)
  const e = parseApiDate(endsAt)
  const sameDay = s.toDateString() === e.toDateString()
  if (sameDay) return `${start} ${untilWord} ${formatTime(e)}`
  const endDay =
    e.getFullYear() === s.getFullYear() ? formatDay(e, locale) : `${formatDay(e, locale)}, ${e.getFullYear()}`
  return `${start} ${untilWord} ${endDay} • ${formatTime(e)}`
}