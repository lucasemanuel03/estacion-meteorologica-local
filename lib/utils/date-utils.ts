import { todayARLocalDate } from "./timezone"

/**
 * Parsea un parámetro de fecha que puede venir en formato `dd/mm/aaaa`, `dd-mm-aaaa` o `yyyy-mm-dd`.
 * Retorna la fecha en formato ISO `YYYY-MM-DD` si es válida, o `null` si no lo es.
 */
export function parseDateParam(dateParam: string | null | undefined): {
  isoDate: string | null
  displayDateStr: string | null
  isValid: boolean
  isToday: boolean
} {
  if (!dateParam || typeof dateParam !== "string") {
    return { isoDate: null, displayDateStr: null, isValid: false, isToday: true }
  }

  const trimmed = dateParam.trim()
  if (!trimmed) {
    return { isoDate: null, displayDateStr: null, isValid: false, isToday: true }
  }

  let year: number
  let month: number
  let day: number

  // Formato DD/MM/YYYY o DD-MM-YYYY
  const dmyMatch = trimmed.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/)
  // Formato YYYY-MM-DD o YYYY/MM/DD
  const ymdMatch = trimmed.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/)

  if (dmyMatch) {
    day = parseInt(dmyMatch[1], 10)
    month = parseInt(dmyMatch[2], 10)
    year = parseInt(dmyMatch[3], 10)
  } else if (ymdMatch) {
    year = parseInt(ymdMatch[1], 10)
    month = parseInt(ymdMatch[2], 10)
    day = parseInt(ymdMatch[3], 10)
  } else {
    return { isoDate: null, displayDateStr: null, isValid: false, isToday: false }
  }

  // Validar límites de fecha
  if (month < 1 || month > 12 || day < 1 || day > 31 || year < 2000 || year > 2100) {
    return { isoDate: null, displayDateStr: null, isValid: false, isToday: false }
  }

  // Verificar validez real de la fecha (p.ej., 31 de Febrero)
  const testDate = new Date(Date.UTC(year, month - 1, day))
  if (
    testDate.getUTCFullYear() !== year ||
    testDate.getUTCMonth() !== month - 1 ||
    testDate.getUTCDate() !== day
  ) {
    return { isoDate: null, displayDateStr: null, isValid: false, isToday: false }
  }

  const paddedMonth = String(month).padStart(2, "0")
  const paddedDay = String(day).padStart(2, "0")
  const isoDate = `${year}-${paddedMonth}-${paddedDay}`
  const displayDateStr = `${paddedDay}/${paddedMonth}/${year}`

  const todayIso = todayARLocalDate()
  const isToday = isoDate === todayIso

  return { isoDate, displayDateStr, isValid: true, isToday }
}

/**
 * Formatea una fecha `YYYY-MM-DD` o `DD/MM/YYYY` en texto legibles en español (p.ej. "JUEVES, 15 DE ENERO DE 2026").
 */
export function formatDateForTitle(dateStr?: string | null): string {
  if (!dateStr) {
    const today = new Date()
    return today
      .toLocaleDateString("es-ES", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
      .toUpperCase()
  }

  const parsed = parseDateParam(dateStr)
  if (parsed.isValid && parsed.isoDate) {
    const [yearStr, monthStr, dayStr] = parsed.isoDate.split("-")
    const year = parseInt(yearStr, 10)
    const month = parseInt(monthStr, 10) - 1
    const day = parseInt(dayStr, 10)

    const dateObj = new Date(Date.UTC(year, month, day))
    return dateObj
      .toLocaleDateString("es-ES", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      })
      .toUpperCase()
  }

  return new Date()
    .toLocaleDateString("es-ES", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    })
    .toUpperCase()
}
