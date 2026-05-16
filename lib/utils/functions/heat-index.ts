/**
 * Módulo para calcular el Índice de Calor (Heat Index)
 * Algoritmo del National Weather Service (NWS) — Rothfusz (SR 90-23)
 * @see https://www.wpc.ncep.noaa.gov/html/heatindex_equation.shtml
 */

export interface HeatIndexResult {
  /** Índice de calor en grados Celsius */
  value: number
  /** Categoría del índice de calor */
  category: "SEGURO" | "PRECAUCIÓN" | "PRECAUCIÓN EXTREMA" | "PELIGRO" | "PELIGRO EXTREMO" | "ERROR AL CALCULAR"
  /** Leyenda descriptiva del impacto en salud */
  description: string
}

/** Umbral en °F: por debajo se usa la fórmula simplificada de Steadman, no la regresión de Rothfusz */
const FULL_REGRESSION_THRESHOLD_F = 80

function celsiusToFahrenheit(celsius: number): number {
  return (celsius * 9) / 5 + 32
}

function fahrenheitToCelsius(fahrenheit: number): number {
  return ((fahrenheit - 32) * 5) / 9
}

/**
 * Fórmula simplificada del NWS para condiciones donde el índice sería < ~80 °F.
 * La regresión completa de Rothfusz no es válida en ese rango.
 */
function calculateSimpleHeatIndexFahrenheit(temperatureF: number, humidity: number): number {
  return 0.5 * (temperatureF + 61.0 + (temperatureF - 68.0) * 1.2 + humidity * 0.094)
}

/**
 * Regresión de Rothfusz + ajustes por humedad extrema (solo T entre 80–112 °F o 80–87 °F).
 */
function calculateRothfuszHeatIndexFahrenheit(temperatureF: number, humidity: number): number {
  const T = temperatureF
  const RH = humidity

  let hi =
    -42.379 +
    2.04901523 * T +
    10.14333127 * RH -
    0.22475541 * T * RH -
    0.00683783 * T * T -
    0.05481717 * RH * RH +
    0.00122874 * T * T * RH +
    0.00085282 * T * RH * RH -
    0.00000199 * T * T * RH * RH

  if (RH < 13 && T >= 80 && T <= 112) {
    hi -= ((13 - RH) / 4) * Math.sqrt((17 - Math.abs(T - 95)) / 17)
  }

  if (RH > 85 && T >= 80 && T <= 87) {
    hi += ((RH - 85) / 10) * ((87 - T) / 5)
  }

  return hi
}

/**
 * Índice de calor en °F según el flujo oficial del NWS.
 */
function calculateHeatIndexFahrenheit(temperatureF: number, humidity: number): number {
  const simpleHi = calculateSimpleHeatIndexFahrenheit(temperatureF, humidity)
  const averagedHi = (simpleHi + temperatureF) / 2

  if (averagedHi < FULL_REGRESSION_THRESHOLD_F) {
    return averagedHi
  }

  return calculateRothfuszHeatIndexFahrenheit(temperatureF, humidity)
}

function getCategoryAndDescription(heatIndexCelsius: number): Pick<HeatIndexResult, "category" | "description"> {
  if (heatIndexCelsius < 27.0) {
    return {
      category: "SEGURO",
      description: "No se esperan efectos adversos debidos al calor.",
    }
  } else if (heatIndexCelsius >= 27.0 && heatIndexCelsius < 32.0) {
    return {
      category: "PRECAUCIÓN",
      description: "Fatiga posible con exposición prolongada y/o actividad física.",
    }
  } else if (heatIndexCelsius >= 32.0 && heatIndexCelsius < 40.0) {
    return {
      category: "PRECAUCIÓN EXTREMA",
      description:
        "Posible golpe de calor, calambres o agotamiento por calor con exposición prolongada y/o actividad física.",
    }
  } else if (heatIndexCelsius >= 40.0 && heatIndexCelsius < 51.0) {
    return {
      category: "PELIGRO",
      description:
        "Calambres o agotamiento por calor probables y golpe de calor posible con exposición prolongada y/o actividad física.",
    }
  } else if (heatIndexCelsius >= 51.0 && heatIndexCelsius <= 92.0) {
    return {
      category: "PELIGRO EXTREMO",
      description: "Golpe de calor altamente probable.",
    }
  } else {
    return {
      category: "ERROR AL CALCULAR",
      description: "Valores más allá de la resistencia humana al calor.",
    }
  }
}

/**
 * Calcula el índice de calor completo con categoría y descripción.
 * @param temperature Temperatura en grados Celsius
 * @param humidity Humedad relativa en porcentaje (0-100)
 */
export function calculateHeatIndex(temperature: number, humidity: number): HeatIndexResult {
  const temperatureF = celsiusToFahrenheit(temperature)
  const heatIndexF = calculateHeatIndexFahrenheit(temperatureF, humidity)
  const value = Math.round(fahrenheitToCelsius(heatIndexF) * 10) / 10
  const { category, description } = getCategoryAndDescription(value)

  return {
    value,
    category,
    description,
  }
}
