const MONTHS_PT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

const pad = (n: number) => String(Math.abs(n)).padStart(2, '0')

/**
 * Datas da API são UTC. O backend envia com "Z", mas respostas antigas (cache Redis)
 * vêm sem offset — e `new Date()` trataria essas como hora local. Mesma regra de `toUtcDate` no middleware.
 */
export function parseApiDate(value: string): Date {
  return new Date(/[zZ]|[+-]\d{2}:\d{2}$/.test(value) ? value : `${value}Z`)
}

/** Data da API (UTC) → valor de <input type="datetime-local"> no fuso do usuário */
export function apiDateToDatetimeLocal(value: string): string {
  const d = parseApiDate(value)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/**
 * Converte o valor cru de um <input type="datetime-local"> (sem timezone)
 * para uma string ISO com o offset de timezone do browser do usuário.
 * Evita ambiguidade quando o backend compara contra o relógio do servidor.
 */
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

const formatDay = (d: Date) => `${pad(d.getDate())} ${MONTHS_PT[d.getMonth()]}`
const formatTime = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`

export function formatEventDate(iso: string): string {
  const d = parseApiDate(iso)
  return `${formatDay(d)}, ${d.getFullYear()} • ${formatTime(d)}`
}

/**
 * "17 Set, 2026 • 22:00 até 23:30" no mesmo dia;
 * "17 Set, 2026 • 22:00 até 18 Set • 02:00" quando atravessa a meia-noite.
 * Sem `endsAt` (cache antigo da API), cai para só o início.
 */
export function formatEventDateRange(startsAt: string, endsAt?: string | null): string {
  const start = formatEventDate(startsAt)
  if (!endsAt) return start
  const s = parseApiDate(startsAt)
  const e = parseApiDate(endsAt)
  const sameDay = s.toDateString() === e.toDateString()
  if (sameDay) return `${start} até ${formatTime(e)}`
  const endDay = e.getFullYear() === s.getFullYear() ? formatDay(e) : `${formatDay(e)}, ${e.getFullYear()}`
  return `${start} até ${endDay} • ${formatTime(e)}`
}
