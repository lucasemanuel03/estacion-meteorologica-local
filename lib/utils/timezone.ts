// Utilidades de zona horaria para Argentina (UTC-3)
// Nota: Hotfix usando offset fijo. Para máxima robustez usar date-fns-tz/luxon con
// 'America/Argentina/Buenos_Aires' si se requiere soporte de reglas futuras/DST.

export const AR_TZ_OFFSET_MINUTES = 3 * 60 // UTC-3

/**
 * Convierte un ISO datetime (UTC o con tz) a fecha local AR (YYYY-MM-DD)
 */
export function toARLocalDateString(iso: string): string {
  const date = new Date(iso)
  const arMs = date.getTime() - AR_TZ_OFFSET_MINUTES * 60 * 1000
  const local = new Date(arMs)
  const y = local.getUTCFullYear()
  const m = local.getUTCMonth() + 1
  const d = local.getUTCDate()
  return `${y.toString().padStart(4, "0")}-${m.toString().padStart(2, "0")}-${d.toString().padStart(2, "0")}`
}

/**
 * Devuelve la fecha de HOY en horario AR (YYYY-MM-DD), corte a las 00:00 AR
 */
export function todayARLocalDate(): string {
  const now = Date.now()
  const arMs = now - AR_TZ_OFFSET_MINUTES * 60 * 1000
  const local = new Date(arMs)
  const y = local.getUTCFullYear()
  const m = local.getUTCMonth() + 1
  const d = local.getUTCDate()
  return `${y.toString().padStart(4, "0")}-${m.toString().padStart(2, "0")}-${d.toString().padStart(2, "0")}`
}

/**
 * Rango UTC [start, end) que corresponde al día local AR (YYYY-MM-DD)
 * start = ese día 03:00:00Z, end = día siguiente 03:00:00Z
 */
export function getUtcRangeForLocalDate(date?: string): { start: string; end: string; localDate: string } {
  const now = new Date()
  const tzOffsetMs = AR_TZ_OFFSET_MINUTES * 60 * 1000
  const localNow = new Date(now.getTime() - tzOffsetMs)

  const [y, m, d] = date
    ? date.split("-").map((n) => parseInt(n, 10))
    : [localNow.getUTCFullYear(), localNow.getUTCMonth() + 1, localNow.getUTCDate()]

  // Medianoche local (UTC-3) corresponde a 03:00 UTC
  const startUtcMs = Date.UTC(y, m - 1, d, AR_TZ_OFFSET_MINUTES / 60, 0, 0)
  const endUtcMs = Date.UTC(y, m - 1, d + 1, AR_TZ_OFFSET_MINUTES / 60, 0, 0)

  const localDate = `${y.toString().padStart(4, "0")}-${m.toString().padStart(2, "0")}-${d
    .toString()
    .padStart(2, "0")}`

  return { start: new Date(startUtcMs).toISOString(), end: new Date(endUtcMs).toISOString(), localDate }
}

/**
 * Devuelve la hora local AR (0..23) para un ISO datetime
 */
export function getARLocalHour(iso: string): number {
  const utcHour = new Date(iso).getUTCHours()
  return (utcHour + 24 - AR_TZ_OFFSET_MINUTES / 60) % 24
}
