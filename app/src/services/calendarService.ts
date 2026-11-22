import type { EventResponse } from '../types/api'

const MOCK_TEMPLATES = [
  { title: 'Noite de Jazz no Centro', category: 'MUSIC', locationName: 'Blue Note Club', hour: 20, durationMin: 180, description: 'Uma noite de jazz contemporâneo com artistas locais.' },
  { title: 'Exposição Vanguarda', category: 'ART', locationName: 'Galeria Aurora', hour: 18, durationMin: 240, description: 'Obras de artistas emergentes da cena urbana.' },
  { title: 'Feira Gastronômica', category: 'FOOD', locationName: 'Praça Central', hour: 12, durationMin: 360, description: 'Sabores de rua, chefs locais e música ao vivo.' },
  { title: 'Corrida Noturna', category: 'SPORTS', locationName: 'Parque Ibirapuera', hour: 19, durationMin: 120, description: 'Percurso de 5 km pela cidade iluminada.' },
  { title: 'Meetup Tech', category: 'NETWORKING', locationName: 'Hub Innovate', hour: 19, durationMin: 120, description: 'Encontro de founders, engenheiros e designers.' },
  { title: 'Festa Underground', category: 'NIGHTLIFE', locationName: 'Club Sub', hour: 23, durationMin: 300, description: 'Line-up secreto, som pesado, ambiente intimista.' },
] as const

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
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const events: EventResponse[] = []

  for (let day = 1; day <= daysInMonth; day++) {
    const seed = hash(year * 10000 + month * 100 + day)
    const r = seed % 100
    // 40% empty, 35% one event, 17% two, 8% three
    const numEvents = r < 40 ? 0 : r < 75 ? 1 : r < 92 ? 2 : 3

    for (let idx = 0; idx < numEvents; idx++) {
      const template = MOCK_TEMPLATES[(seed + idx * 7) % MOCK_TEMPLATES.length]
      const startsAt = new Date(year, month, day, template.hour, 0, 0)
      const endsAt = new Date(startsAt.getTime() + template.durationMin * 60_000)

      events.push({
        id: mockEventId(year, month, day, idx),
        creatorId: 'mock-creator',
        creatorUsername: 'mock.user',
        title: template.title,
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
 * Currently mocked — no per-month endpoint exists yet. When the backend
 * exposes one (e.g. `GET /api/events/my/month?year=YYYY&month=M` with M 1-indexed),
 * replace the body with:
 *
 *   return http.get<EventResponse[]>(`/api/events/my/month?year=${year}&month=${month + 1}`)
 *
 * Nothing else in the calendar (hook, components, UI) needs to change.
 */
export async function getEventsForMonth(year: number, month: number): Promise<EventResponse[]> {
  return generateMockEvents(year, month)
}