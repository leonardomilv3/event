import type { EventResponse } from '../types/api'

const MOCK_TEMPLATES = [
  { title: 'Noite de Jazz no Centro', category: 'MUSIC', locationName: 'Blue Note Club', hour: 20, durationMin: 180, description: 'Uma noite de jazz contemporâneo com artistas locais.' },
  { title: 'Exposição Vanguarda', category: 'ART', locationName: 'Galeria Aurora', hour: 18, durationMin: 240, description: 'Obras de artistas emergentes da cena urbana.' },
  { title: 'Feira Gastronômica', category: 'FOOD', locationName: 'Praça Central', hour: 12, durationMin: 360, description: 'Sabores de rua, chefs locais e música ao vivo.' },
  { title: 'Corrida Noturna', category: 'SPORTS', locationName: 'Parque Ibirapuera', hour: 19, durationMin: 120, description: 'Percurso de 5 km pela cidade iluminada.' },
  { title: 'Meetup Tech', category: 'NETWORKING', locationName: 'Hub Innovate', hour: 19, durationMin: 120, description: 'Encontro de founders, engenheiros e designers.' },
  { title: 'Festa Underground', category: 'NIGHTLIFE', locationName: 'Club Sub', hour: 23, durationMin: 300, description: 'Line-up secreto, som pesado, ambiente intimista.' },
] as const

/** Empty month for testing the empty-state UI. */
const EMPTY_MONTH = { year: 2026, month: 11 } // December 2026 (0-indexed)

/**
 * Days with a forced event count (for testing specific limits).
 * Key = day of month; value = number of events.
 * Only applies to months that are not EMPTY_MONTH.
 */
const FORCED_DAYS: Record<number, number> = {
  5: 7,   // overflow: 5 shown in popover + 2 hidden
  10: 5,  // exactly at popover limit — no overflow
  15: 8,  // heavy overflow (mock "busy night")
  20: 6,  // just over the limit
  3: 0,   // empty day in a busy month
  7: 0,
  14: 0,
  21: 0,
  25: 0,
}

function hash(n: number): number {
  let x = n | 0
  x = ((x >> 16) ^ x) * 0x45d9f3b | 0
  x = ((x >> 16) ^ x) * 0x45d9f3b | 0
  x = (x >> 16) ^ x
  return Math.abs(x)
}

function mockEventId(year: number, month: number, day: number, idx: number): string {
  const h = hash(year * 100000 + month * 1000 + day * 10 + idx)
  return `mock-${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}-${idx}-${h}`
}

function generateMockEvents(year: number, month: number): EventResponse[] {
  if (year === EMPTY_MONTH.year && month === EMPTY_MONTH.month) return []

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const events: EventResponse[] = []

  for (let day = 1; day <= daysInMonth; day++) {
    let numEvents: number
    if (day in FORCED_DAYS) {
      numEvents = FORCED_DAYS[day]
    } else {
      const seed = hash(year * 10000 + month * 100 + day)
      const r = seed % 100
      numEvents = r < 45 ? 1 : r < 75 ? 2 : r < 92 ? 3 : 4
    }

    for (let idx = 0; idx < numEvents; idx++) {
      const seed = hash(year * 10000 + month * 100 + day * 31 + idx * 7)
      const template = MOCK_TEMPLATES[(seed + idx * 7) % MOCK_TEMPLATES.length]
      // Stagger start times so multiple events on the same day don't overlap exactly
      const startHour = template.hour + (idx === 0 ? 0 : idx === 1 ? 1 : idx * 0.5)
      const startMinute = idx % 2 === 0 ? 0 : 30
      const startsAt = new Date(year, month, day, Math.floor(startHour), startMinute, 0)
      const endsAt = new Date(startsAt.getTime() + template.durationMin * 60_000)

      events.push({
        id: mockEventId(year, month, day, idx),
        creatorId: 'mock-creator',
        creatorUsername: 'mock.user',
        title: `${template.title}${idx > 0 ? ` #${idx + 1}` : ''}`,
        description: template.description,
        category: template.category,
        visibility: 'PUBLIC',
        status: 'PUBLISHED',
        locationName: template.locationName,
        startsAt: startsAt.toISOString(),
        endsAt: endsAt.toISOString(),
        participantCount: (seed % 50) + 5,
        maxParticipants: (seed % 100) + 20,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
    }
  }
  return events
}

/**
 * Fetches the current user's events for the given month.
 *
 * Currently mocked — the swap to the real backend is a one-liner:
 *
 *   return http.get<EventResponse[]>(`/api/events/my/month?year=${year}&month=${month + 1}`)
 */
export async function getEventsForMonth(year: number, month: number): Promise<EventResponse[]> {
  return generateMockEvents(year, month)
}