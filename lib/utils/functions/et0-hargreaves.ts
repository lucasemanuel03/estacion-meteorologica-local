export interface ET0Result {
  /** Evapotranspiración de referencia en mm/día */
  value: number
  /** Unidad de medida */
  unit: "mm/día"
  /** Método científico aplicado */
  method: "Hargreaves-Samani"
  /** Radiación solar extraterrestre Ra calculada (MJ/m²/día) */
  solarRadiationRa: number
  /** Descripción agronómica */
  description: string
}

/**
 * Obtiene el día del año (Day of Year, DOY / 1-366) para una fecha dada.
 */

export function getDayOfYear(date: Date = new Date()): number {
  const start = new Date(date.getFullYear(), 0, 0)
  const diff = date.getTime() - start.getTime()
  const oneDay = 1000 * 60 * 60 * 24
  return Math.floor(diff / oneDay)
}

/**
 * Calcula la Radiación Solar Extraterrestre Ra (MJ/m²/día) según ecuaciones FAO-56.
 *
 * @param latitudeDeg - Latitud en grados decimales (ej. -34.6 para zona rural Pampeana/Argentina)
 * @param date - Fecha de cálculo
 * @returns Ra en MJ · m⁻² · día⁻¹
 */
export function calculateSolarRadiationRa(latitudeDeg: number, date: Date = new Date()): number {
  const J = getDayOfYear(date)
  const phi = (latitudeDeg * Math.PI) / 180 // Latitud en radianes

  // Distancia relativa inversa Tierra-Sol (dr)
  const dr = 1 + 0.033 * Math.cos((2 * Math.PI * J) / 365)

  // Declinación solar (delta en radianes)
  const delta = 0.409 * Math.sin(((2 * Math.PI * J) / 365) - 1.39)

  // Ángulo horario de puesta del sol (omega_s)
  const x = -Math.tan(phi) * Math.tan(delta)
  let omegas = 0
  if (x >= 1) {
    omegas = 0
  } else if (x <= -1) {
    omegas = Math.PI
  } else {
    omegas = Math.acos(x)
  }

  // Constante solar Gsc = 0.0820 MJ/m²/min
  const Gsc = 0.0820
  const Ra = ((24 * 60) / Math.PI) * Gsc * dr * (
    omegas * Math.sin(phi) * Math.sin(delta) +
    Math.cos(phi) * Math.cos(delta) * Math.sin(omegas)
  )

  return Number(Ra.toFixed(2))
}

/**
 * Calcula la Evapotranspiración de Referencia (ET0) utilizando la ecuación de Hargreaves-Samani (1985).
 * ET0 = 0.0023 * (0.408 * Ra) * (Tmean + 17.8) * sqrt(Tmax - Tmin)
 *
 * @param tempMax - Temperatura máxima registrada en el día (°C)
 * @param tempMin - Temperatura mínima registrada en el día (°C)
 * @param date - Fecha de referencia (opcional, por defecto hoy)
 * @param latitudeDeg - Latitud del sensor (opcional, se puede configurar por ENV, defecto -34.6)
 * @returns ET0Result o null si las lecturas no son suficientes
 */
export function calculateET0Hargreaves(
  tempMax: number | null | undefined,
  tempMin: number | null | undefined,
  date: Date = new Date(),
  latitudeDeg: number = Number(process.env.STATION_LATITUDE) || -34.6
): ET0Result | null {
  if (tempMax === null || tempMax === undefined || tempMin === null || tempMin === undefined) {
    return null
  }

  // Si no hay amplitud térmica suficiente (Tmax <= Tmin)
  if (tempMax <= tempMin) {
    return null
  }

  const tempMean = (tempMax + tempMin) / 2
  const Ra = calculateSolarRadiationRa(latitudeDeg, date)

  // 0.408 convierte MJ/m²/día a mm/día de agua equivalente
  const RaEquivalentMm = 0.408 * Ra
  const deltaT = tempMax - tempMin

  const rawET0 = 0.0023 * RaEquivalentMm * (tempMean + 17.8) * Math.sqrt(deltaT)
  const value = Number(Math.max(0, rawET0).toFixed(2))

  let description = "Evapotranspiración de referencia diaria baja."
  if (value >= 3 && value < 6) {
    description = "Evapotranspiración de referencia diaria moderada."
  } else if (value >= 6) {
    description = "Evapotranspiración de referencia diaria elevada. Demanda hídrica alta de los cultivos."
  }

  return {
    value,
    unit: "mm/día",
    method: "Hargreaves-Samani",
    solarRadiationRa: Ra,
    description,
  }
}
