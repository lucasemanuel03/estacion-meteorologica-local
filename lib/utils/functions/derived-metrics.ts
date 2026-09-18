import calcularPuntoRocio from "./calcularPuntoRocio"
import { calculateITH, type ITHResult } from "./ith"
import { calculateET0Hargreaves, type ET0Result } from "./et0-hargreaves"

export interface DewPointResult {
  /** Temperatura de punto de rocío en °C */
  value: number
  /** Unidad */
  unit: "°C"
}

export interface DeltaTResult {
  /** Valor numérico de Delta T (°C) */
  value: number
  /** Unidad */
  unit: "°C"
  /** Categoría de la ventana de pulverización */
  category: "BAJO" | "ÓPTIMO" | "ALTO" | "CRÍTICO"
  /** Descripción para aplicación de agroquímicos */
  description: string
}

export interface FrostRiskResult {
  /** Categoría del riesgo de helada */
  category: "NINGUNO" | "BAJO" | "MODERADO" | "ALTO (HELADA BLANCA)" | "CRÍTICO (HELADA NEGRA)"
  /** Descripción orientativa para protección de cultivos */
  description: string
}

export interface DerivedMetrics {
  /** Índice de Temperatura y Humedad ganadero */
  ith: ITHResult | null
  /** Evapotranspiración de referencia (Hargreaves-Samani) */
  et0: ET0Result | null
  /** Punto de rocío */
  dewPoint: DewPointResult | null
  /** Delta T para pulverización agrícola */
  deltaT: DeltaTResult | null
  /** Evaluación de riesgo de helada */
  frostRisk: FrostRiskResult | null
}

/**
 * Calcula la temperatura de bulbo húmedo (Twet) mediante la ecuación empírica de Stull (2011).
 * Válida para temperaturas de -20°C a 50°C y humedad relativa de 5% a 99%.
 */
export function calculateWetBulbTemperature(temperature: number, humidity: number): number {
  const T = temperature
  const RH = humidity

  const twet =
    T * Math.atan(0.151977 * Math.sqrt(RH + 8.313659)) +
    Math.atan(T + RH) -
    Math.atan(RH - 1.676331) +
    0.00391838 * Math.pow(RH, 1.5) * Math.atan(0.023101 * RH) -
    4.686035

  return twet
}

/**
 * Calcula el Delta T (diferencia entre bulbo seco y bulbo húmedo en °C).
 * Indicador primario utilizado en agricultura para determinar las condiciones de pulverización.
 */
export function calculateDeltaT(
  temperature: number | null | undefined,
  humidity: number | null | undefined
): DeltaTResult | null {
  if (temperature === null || temperature === undefined || humidity === null || humidity === undefined) {
    return null
  }

  if (humidity < 5 || humidity > 100) {
    return null
  }

  const twet = calculateWetBulbTemperature(temperature, humidity)
  const deltaTValue = temperature - twet
  const value = Number(Math.max(0, deltaTValue).toFixed(1))

  if (value < 2.0) {
    return {
      value,
      unit: "°C",
      category: "BAJO",
      description: "Delta T muy bajo. Riesgo de deriva por gotas suspendidas e inversión térmica.",
    }
  }

  if (value <= 8.0) {
    return {
      value,
      unit: "°C",
      category: "ÓPTIMO",
      description: "Ventana óptima para pulverización y aplicación de agroquímicos/fitosanitarios.",
    }
  }

  if (value <= 10.0) {
    return {
      value,
      unit: "°C",
      category: "ALTO",
      description: "Evaporación rápida de gotas. Se sugiere el uso de gotas más grandes o coadyuvantes antideriva.",
    }
  }

  return {
    value,
    unit: "°C",
    category: "CRÍTICO",
    description: "Delta T elevado (evaporación extrema). No se recomienda la aplicación de agroquímicos.",
  }
}

/**
 * Evalúa el riesgo de helada y diferencia entre Helada Blanca y Helada Negra.
 */
export function calculateFrostRisk(
  temperature: number | null | undefined,
  humidity: number | null | undefined,
  dewPoint: number | null | undefined
): FrostRiskResult | null {
  if (temperature === null || temperature === undefined || dewPoint === null || dewPoint === undefined) {
    return null
  }

  const rh = humidity ?? 50

  if (temperature > 10 || dewPoint > 5) {
    return {
      category: "NINGUNO",
      description: "Sin riesgo de helada inmediato.",
    }
  }

  if (dewPoint > 2) {
    return {
      category: "BAJO",
      description: "Baja probabilidad de enfriamiento severo.",
    }
  }

  if (dewPoint > 0) {
    return {
      category: "MODERADO",
      description: "Monitorear descenso nocturno de temperatura. Posible condensación helada en capas bajas.",
    }
  }

  // Si el punto de rocío es <= 0 °C
  if (rh >= 70) {
    return {
      category: "ALTO (HELADA BLANCA)",
      description: "Riesgo de Helada Blanca: Se prevé formación de escarcha visible sobre la vegetación.",
    }
  }

  return {
    category: "CRÍTICO (HELADA NEGRA)",
    description: "Riesgo de Helada Negra (Aire muy seco y congelamiento bajo cero). Alta peligrosidad: quema vegetal sin escarcha visible.",
  }
}

/**
 * Función principal integradora para calcular el objeto completo de métricas derivadas.
 */
export function calculateAllDerivedMetrics(
  temperature: number | null | undefined,
  humidity: number | null | undefined,
  tempMax?: number | null,
  tempMin?: number | null
): DerivedMetrics {
  const dewPointValue = calcularPuntoRocio(temperature ?? null, humidity ?? null)
  const dewPoint: DewPointResult | null = dewPointValue !== null ? { value: Number(dewPointValue.toFixed(1)), unit: "°C" } : null

  const ith = calculateITH(temperature, humidity)
  const et0 = calculateET0Hargreaves(tempMax, tempMin)
  const deltaT = calculateDeltaT(temperature, humidity)
  const frostRisk = calculateFrostRisk(temperature, humidity, dewPointValue)

  return {
    ith,
    et0,
    dewPoint,
    deltaT,
    frostRisk,
  }
}
