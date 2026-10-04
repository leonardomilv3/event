export interface Coordinates {
  latitude: number
  longitude: number
}

export function formatCoordinate(value: number): string {
  return value.toFixed(6)
}

/**
 * `null` = nenhum dos dois preenchidos; `'invalid'` = só um deles ou fora do intervalo.
 * Mesmos limites de @DecimalMin/@DecimalMax em Create/UpdateEventRequest.
 */
export function parseCoordinates(lat: string, lon: string): Coordinates | null | 'invalid' {
  const latTrim = lat.trim().replace(',', '.')
  const lonTrim = lon.trim().replace(',', '.')
  if (!latTrim && !lonTrim) return null
  if (!latTrim || !lonTrim) return 'invalid'
  const latitude = Number(latTrim)
  const longitude = Number(lonTrim)
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return 'invalid'
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) return 'invalid'
  return { latitude, longitude }
}
