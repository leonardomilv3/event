export const REDIRECT_PARAM = 'redirect'

/** Monta `/login?redirect=...` (ou `/register?...`) preservando o destino pós-autenticação. */
export function buildAuthPath(returnTo: string, base: '/login' | '/register' = '/login'): string {
  const safe = getSafeRedirect(returnTo, '')
  return safe && safe !== '/' ? `${base}?${REDIRECT_PARAM}=${encodeURIComponent(safe)}` : base
}

/**
 * Aceita apenas caminhos relativos da própria aplicação — bloqueia open redirect
 * (`//evil.com`, `/\evil.com`, `https://...`).
 */
export function getSafeRedirect(value: string | null | undefined, fallback = '/'): string {
  if (!value) return fallback
  if (!value.startsWith('/') || value.startsWith('//') || value.startsWith('/\\')) return fallback
  if (value.startsWith('/login') || value.startsWith('/register')) return fallback
  return value
}
