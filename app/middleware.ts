/**
 * Vercel Routing Middleware — pré-renderização de meta tags para crawlers.
 *
 * A SPA só define <title>/<meta> via JS; crawlers de preview social (WhatsApp,
 * Facebook, X, Telegram…) e o `curl` não executam JS. Para esses user-agents,
 * `/events/:id` devolve o próprio index.html com OG/Twitter/SEO/JSON-LD do evento
 * injetados — o SPA continua bootando normalmente se o cliente executar JS.
 * Humanos seguem direto para o arquivo estático (sem latência extra).
 *
 * Também faz proxy de `/sitemap.xml` para a API (gerado pelo Quarkus, cache Redis 1h).
 *
 * Env (Vercel → Settings → Environment Variables):
 *   API_URL   — base da API Quarkus (fallback: VITE_API_URL, depois Render prod)
 *   SITE_URL  — origem canônica do site (fallback: origem da requisição)
 */
import { next } from '@vercel/functions'

export const config = {
  matcher: ['/events/:id', '/sitemap.xml'],
}

const DEFAULT_API_URL = 'https://eventing-api.onrender.com'
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&q=80'
const DESCRIPTION_MAX = 150
// Render free tier pode estar em cold start; crawlers costumam esperar ~5–10s
const EVENT_FETCH_TIMEOUT_MS = 8000
const SITEMAP_FETCH_TIMEOUT_MS = 20000

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const BOT_UA_RE = new RegExp(
  [
    'facebookexternalhit', 'facebot', 'meta-externalagent', 'twitterbot', 'whatsapp',
    'telegrambot', 'slackbot', 'linkedinbot', 'discordbot', 'pinterest', 'redditbot',
    'skypeuripreview', 'vkshare', 'embedly', 'iframely', 'applebot',
    'googlebot', 'google-inspectiontool', 'bingbot', 'duckduckbot', 'yandex', 'baiduspider',
    'curl', 'wget', 'python-requests',
  ].join('|'),
  'i',
)

interface EventPayload {
  id: string
  title: string
  description: string | null
  category: string
  visibility: 'PUBLIC' | 'PRIVATE' | 'INVITE_ONLY'
  status: 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | string
  coverImageUrl: string | null
  locationName: string | null
  address: string | null
  startsAt: string
  endsAt: string | null
  creatorUsername: string
}

interface ApiEnvelope<T> {
  success: boolean
  data: T | null
}

export default async function middleware(request: Request): Promise<Response> {
  const url = new URL(request.url)
  const apiUrl = (process.env.API_URL ?? process.env.VITE_API_URL ?? DEFAULT_API_URL).replace(/\/$/, '')

  if (url.pathname === '/sitemap.xml') {
    return proxySitemap(apiUrl)
  }

  const id = url.pathname.split('/')[2] ?? ''
  const userAgent = request.headers.get('user-agent') ?? ''
  if (!UUID_RE.test(id) || !BOT_UA_RE.test(userAgent)) {
    return next()
  }

  const siteUrl = (process.env.SITE_URL ?? url.origin).replace(/\/$/, '')

  const [event, indexHtml] = await Promise.all([
    fetchEvent(apiUrl, id),
    fetchIndexHtml(url.origin),
  ])

  // Nunca expor metadados de eventos não públicos ou não publicados
  if (!event || event.visibility !== 'PUBLIC' || event.status !== 'PUBLISHED') {
    return next()
  }

  const head = renderHead(event, `${siteUrl}/events/${event.id}`)
  const html = indexHtml && /<title>[\s\S]*?<\/title>/i.test(indexHtml)
    ? indexHtml.replace(/<title>[\s\S]*?<\/title>/i, head)
    : renderStandalone(event, head, `${siteUrl}/events/${event.id}`)

  return new Response(html, {
    status: 200,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'public, max-age=300',
      vary: 'User-Agent',
    },
  })
}

// ── Fetch helpers ────────────────────────────────────────────────────────────

async function fetchEvent(apiUrl: string, id: string): Promise<EventPayload | null> {
  try {
    const res = await fetch(`${apiUrl}/api/events/${id}`, {
      headers: { accept: 'application/json' },
      signal: AbortSignal.timeout(EVENT_FETCH_TIMEOUT_MS),
    })
    if (!res.ok) return null
    const body = (await res.json()) as ApiEnvelope<EventPayload>
    return body.success ? body.data : null
  } catch {
    return null
  }
}

async function fetchIndexHtml(origin: string): Promise<string | null> {
  try {
    const res = await fetch(`${origin}/index.html`, { signal: AbortSignal.timeout(3000) })
    return res.ok ? await res.text() : null
  } catch {
    return null
  }
}

async function proxySitemap(apiUrl: string): Promise<Response> {
  try {
    const res = await fetch(`${apiUrl}/sitemap.xml`, {
      headers: { accept: 'application/xml' },
      signal: AbortSignal.timeout(SITEMAP_FETCH_TIMEOUT_MS),
    })
    if (!res.ok) throw new Error(`sitemap upstream ${res.status}`)
    return new Response(await res.text(), {
      status: 200,
      headers: {
        'content-type': 'application/xml; charset=utf-8',
        'cache-control': 'public, max-age=3600',
      },
    })
  } catch {
    return new Response('Sitemap temporariamente indisponível', {
      status: 503,
      headers: { 'retry-after': '120', 'content-type': 'text/plain; charset=utf-8' },
    })
  }
}

// ── Rendering ────────────────────────────────────────────────────────────────

/** API serializa LocalDateTime em UTC sem offset. */
function toUtcDate(value: string): Date {
  return new Date(/[zZ]|[+-]\d{2}:\d{2}$/.test(value) ? value : `${value}Z`)
}

function formatDatePtBr(value: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Sao_Paulo',
  }).format(toUtcDate(value))
}

function truncate(text: string, max: number): string {
  const clean = text.replace(/\s+/g, ' ').trim()
  if (clean.length <= max) return clean
  const cut = clean.slice(0, max - 1)
  const lastSpace = cut.lastIndexOf(' ')
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function buildDescription(event: EventPayload): string {
  const when = formatDatePtBr(event.startsAt)
  const where = event.locationName ? ` · ${event.locationName}` : ''
  const prefix = `${when}${where}`
  const body = event.description?.trim()
  return truncate(body ? `${prefix} — ${body}` : `${prefix} — veja quem vai no Eventing.`, DESCRIPTION_MAX)
}

function renderHead(event: EventPayload, canonicalUrl: string): string {
  const title = [event.title, event.locationName, 'Eventing'].filter(Boolean).join(' — ')
  const description = buildDescription(event)
  const image = event.coverImageUrl ?? FALLBACK_IMAGE

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.title,
    description: event.description ?? description,
    startDate: toUtcDate(event.startsAt).toISOString(),
    ...(event.endsAt ? { endDate: toUtcDate(event.endsAt).toISOString() } : {}),
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    image: [image],
    url: canonicalUrl,
    organizer: { '@type': 'Person', name: event.creatorUsername },
    ...(event.locationName || event.address
      ? {
          location: {
            '@type': 'Place',
            name: event.locationName ?? event.address,
            address: event.address ?? event.locationName,
          },
        }
      : {}),
  }

  const t = escapeHtml(title)
  const d = escapeHtml(description)
  const og = escapeHtml(event.title)
  const img = escapeHtml(image)
  const u = escapeHtml(canonicalUrl)

  return [
    `<title>${t}</title>`,
    `<meta name="description" content="${d}" />`,
    `<link rel="canonical" href="${u}" />`,
    `<meta property="og:site_name" content="Eventing" />`,
    `<meta property="og:locale" content="pt_BR" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:title" content="${og}" />`,
    `<meta property="og:description" content="${d}" />`,
    `<meta property="og:image" content="${img}" />`,
    `<meta property="og:image:alt" content="${og}" />`,
    `<meta property="og:url" content="${u}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${og}" />`,
    `<meta name="twitter:description" content="${d}" />`,
    `<meta name="twitter:image" content="${img}" />`,
    // `<` escapado para não fechar o <script> prematuramente
    `<script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}</script>`,
  ].join('\n    ')
}

/** Fallback quando o index.html estático não pôde ser lido (ex.: deployment protegido). */
function renderStandalone(event: EventPayload, head: string, canonicalUrl: string): string {
  return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    ${head}
  </head>
  <body>
    <h1>${escapeHtml(event.title)}</h1>
    <p>${escapeHtml(buildDescription(event))}</p>
    <a href="${escapeHtml(canonicalUrl)}">Ver evento no Eventing</a>
  </body>
</html>`
}
