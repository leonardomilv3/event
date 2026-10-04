const HTTP_URL = /^https?:\/\/\S+$/

/** Mesma regra do backend (`@Pattern` em Create/UpdateEventRequest): só http(s), bloqueia `javascript:` em href */
export function isHttpUrl(value: string): boolean {
  return HTTP_URL.test(value)
}

export function urlHost(value: string): string {
  try {
    return new URL(value).hostname.replace(/^www\./, '')
  } catch {
    return value
  }
}
