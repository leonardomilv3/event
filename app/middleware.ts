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
 * Resolução de idioma (ordem de prioridade):
 *   1. `?hl=pt-BR` / `?hl=en` na URL — vem do app quando o usuário compartilha.
 *      (Fonte mais confiável: WhatsApp/Telegram não enviam Accept-Language.)
 *   2. Header `Accept-Language` — X e Facebook enviam; WhatsApp/Telegram não.
 *   3. Fallback `'en'`.
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

// ── Locales ──────────────────────────────────────────────────────────────────

type Locale = 'pt-BR' | 'en'

const DEFAULT_LOCALE: Locale = 'en'

const LOCALE_CONFIG: Record<
  Locale,
  {
    intlLocale: string
    htmlLang: string
    ogLocale: string
    ogLocaleAlternate: string
    noDescription: string
    viewEvent: string
    sitemapError: string
  }
> = {
  'pt-BR': {
    intlLocale: 'pt-BR',
    htmlLang: 'pt-BR',
    ogLocale: 'pt_BR',
    ogLocaleAlternate: 'en_US',
    noDescription: 'veja quem vai no Eventing.',
    viewEvent: 'Ver evento no Eventing',
    sitemapError: 'Sitemap temporariamente indisponível',
  },
  en: {
    intlLocale: 'en-US',
    htmlLang: 'en',
    ogLocale: 'en_US',
    ogLocaleAlternate: 'pt_BR',
    noDescription: "see who's going on Eventing.",
    viewEvent: 'View event on Eventing',
    sitemapError: 'Sitemap temporarily unavailable',
  },
}

/** Normaliza um valor de `?hl=` para um Locale conhecido, ou null se inválido. */
function parseLocaleParam(value: string | null): Locale | null {
  if (!value) return null
  const lower = value.toLowerCase()
  if (lower === 'pt-br' || lower === 'pt' || lower.startsWith('pt-')) return 'pt-BR'
  if (lower === 'en' || lower.startsWith('en-')) return 'en'
  return null
}

/** Parse do header Accept-Language; retorna o primeiro locale suportado. */
function parseAcceptLanguage(header: string | null): Locale | null {
  if (!header || header.trim() === '*' || header.trim() === '') return null

  const parsed = header
    .split(',')
    .map((part) => {
      const [tag, q] = part.trim().split(';q=')
      return { tag: tag.trim().toLowerCase(), q: q ? Number(q) : 1 }
    })
    .filter((entry) => entry.tag.length > 0 && !Number.isNaN(entry.q))
    .sort((a, b) => b.q - a.q)

  for (const { tag } of parsed) {
    if (tag.startsWith('pt')) return 'pt-BR'
    if (tag.startsWith('en')) return 'en'
  }
  return null
}

/** Prioridade: `?hl` > Accept-Language > 'en'. */
function resolveLocale(request: Request, url: URL): Locale {
  return (
    parseLocaleParam(url.searchParams.get('hl')) ??
    parseAcceptLanguage(request.headers.get('accept-language')) ??
    DEFAULT_LOCALE
  )
}

// ── Types ────────────────────────────────────────────────────────────────────

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

// ── Handler ──────────────────────────────────────────────────────────────────

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

  const locale = resolveLocale(request, url)
  const siteUrl = (process.env.SITE_URL ?? url.origin).replace(/\/$/, '')

  const [event, indexHtml] = await Promise.all([
    fetchEvent(apiUrl, id),
    fetchIndexHtml(url.origin),
  ])

  // Nunca expor metadados de eventos não públicos ou não publicados
  if (!event || event.visibility !== 'PUBLIC' || event.status !== 'PUBLISHED') {
    return next()
  }

  const head = renderHead(event, `${siteUrl}/events/${event.id}`, locale)
  const html =
    indexHtml && /<title>[\s\S]*?<\/title>/i.test(indexHtml)
      ? injectIntoHtml(indexHtml, locale, head)
      : renderStandalone(event, head, `${siteUrl}/events/${event.id}`, locale)

  return new Response(html, {
    status: 200,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'content-language': locale,
      'cache-control': 'public, max-age=300',
      // Vary inclui Accept-Language porque ele influencia a renderização
      // (Facebook/X enviam; WhatsApp/Telegram não, caem no `?hl` ou fallback).
      vary: 'User-Agent, Accept-Language',
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
    return new Response(LOCALE_CONFIG.en.sitemapError, {
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

function formatDate(value: string, locale: Locale): string {
  return new Intl.DateTimeFormat(LOCALE_CONFIG[locale].intlLocale, {
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

function buildDescription(event: EventPayload, locale: Locale): string {
  const cfg = LOCALE_CONFIG[locale]
  const when = formatDate(event.startsAt, locale)
  const where = event.locationName ? ` · ${event.locationName}` : ''
  const prefix = `${when}${where}`
  const body = event.description?.trim()
  return truncate(body ? `${prefix} — ${body}` : `${prefix} — ${cfg.noDescription}`, DESCRIPTION_MAX)
}

function renderHead(event: EventPayload, canonicalUrl: string, locale: Locale): string {
  const cfg = LOCALE_CONFIG[locale]
  const title = [event.title, event.locationName, 'Eventing'].filter(Boolean).join(' — ')
  const description = buildDescription(event, locale)
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
    `<meta property="og:locale" content="${cfg.ogLocale}" />`,
    `<meta property="og:locale:alternate" content="${cfg.ogLocaleAlternate}" />`,
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

/**
 * Injeta o head traduzido no index.html servido pela Vercel:
 *   - Troca `<html lang="...">` para o locale resolvido (SEO/a11y).
 *   - Substitui o bloco `<title>...</title>` pelo head completo (title + meta + JSON-LD).
 * Preserva todos os outros atributos (ex.: `class="dark"`).
 */
function injectIntoHtml(html: string, locale: Locale, head: string): string {
  const cfg = LOCALE_CONFIG[locale]

  // 1. Substitui <html lang="..."> preservando demais atributos.
  let result = html.replace(/<html\b([^>]*)>/i, (_, attrs: string) => {
    const withoutLang = attrs.replace(/\s+lang=("[^"]*"|'[^']*')/i, '')
    return `<html${withoutLang} lang="${cfg.htmlLang}">`
  })

  // 2. Substitui o <title> original pelo bloco de meta completo.
  result = result.replace(/<title>[\s\S]*?<\/title>/i, head)

  return result
}

/** Fallback quando o index.html estático não pôde ser lido (ex.: deployment protegido). */
function renderStandalone(
  event: EventPayload,
  head: string,
  canonicalUrl: string,
  locale: Locale,
): string {
  const cfg = LOCALE_CONFIG[locale]
  return `<!doctype html>
<html lang="${cfg.htmlLang}">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    ${head}
  </head>
  <body>
    <h1>${escapeHtml(event.title)}</h1>
    <p>${escapeHtml(buildDescription(event, locale))}</p>
    <a href="${escapeHtml(canonicalUrl)}">${escapeHtml(cfg.viewEvent)}</a>
  </body>
</html>`
}