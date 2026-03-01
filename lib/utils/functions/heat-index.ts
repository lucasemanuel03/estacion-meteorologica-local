/**
 * Módulo para calcular el Índice de Calor (Heat Index)
 * Basado en la fórmula del National Weather Service (NWS)
 */

export interface HeatIndexResult {
  /** Índice de calor en grados Celsius */
  value: number
  /** Categoría del índice de calor */
  category: "SEGURO" | "PRECAUCIÓN" | "PRECAUCIÓN EXTREMA" | "PELIGRO" | "PELIGRO EXTREMO" | "ERROR AL CALCULAR"
  /** Leyenda descriptiva del impacto en salud */
  description: string
}

/**
 * Convierte temperatura de Celsius a Fahrenheit
 */
function celsiusToFahrenheit(celsius: number): number {
  return (celsius * 9/5) + 32
}

/**
 * Convierte temperatura de Fahrenheit a Celsius
 */
function fahrenheitToCelsius(fahrenheit: number): number {
  return (fahrenheit - 32) * 5/9
}

/**
 * Calcula el índice de calor usando la fórmula del NWS
 * @param temperature Temperatura en grados Celsius
 * @param humidity Humedad relativa en porcentaje (0-100)
 * @returns Índice de calor en grados Fahrenheit
 */
function calculateHeatIndexFahrenheit(temperature: number, humidity: number): number {
  // Convertir temperatura a Fahrenheit para el cálculo
  const T = celsiusToFahrenheit(temperature)
  const RH = humidity

  // Fórmula del NWS para Heat Index
  // Heat Index = -42.379 + (2.04901523*T) + (10.14333127*RH) - (.22475541*T*RH) - (.00683783*T*T) - (.05481717*RH*RH) + (.00122874*T*T*RH) + (.00085282*T*RH*RH) - (.00000199*T*T*RH*RH)
  
  const HI = -42.379
    + (2.04901523 * T)
    + (10.14333127 * RH)
    - (0.22475541 * T * RH)
    - (0.00683783 * T * T)
    - (0.05481717 * RH * RH)
    + (0.00122874 * T * T * RH)
    + (0.00085282 * T * RH * RH)
    - (0.00000199 * T * T * RH * RH)

  return HI
}

/**
 * Determina la categoría y descripción basada en el valor del índice de calor
 * @param heatIndexCelsius Índice de calor en grados Celsius
 */
function getCategoryAndDescription(heatIndexCelsius: number): Pick<HeatIndexResult, "category" | "description"> {
  if (heatIndexCelsius < 27.0) {
    return {
      category: "SEGURO",
      description: "No se esperan efectos adversos debidos al calor."
    }
  } else if (heatIndexCelsius >= 27.0 && heatIndexCelsius < 32.0) {
    return {
      category: "PRECAUCIÓN",
      description: "Fatiga posible con exposición prolongada y/o actividad física."
    }
  } else if (heatIndexCelsius >= 32.0 && heatIndexCelsius < 40.0) {
    return {
      category: "PRECAUCIÓN EXTREMA",
      description: "Posible golpe de calor, calambres o agotamiento por calor con exposición prolongada y/o actividad física."
    }
  } else if (heatIndexCelsius >= 40.0 && heatIndexCelsius < 51.0) {
    return {
      category: "PELIGRO",
      description: "Calambres o agotamiento por calor probables y golpe de calor posible con exposición prolongada y/o actividad física."
    }
  } else if (heatIndexCelsius >= 51.0 && heatIndexCelsius <= 92.0) {
    return {
      category: "PELIGRO EXTREMO",
      description: "Golpe de calor altamente probable."
    }
  } else {
    return {
      category: "ERROR AL CALCULAR",
      description: "Valores más allá de la resistencia humana al calor."
    }
  }
}

/**
 * Calcula el índice de calor completo con categoría y descripción
 * @param temperature Temperatura en grados Celsius
 * @param humidity Humedad relativa en porcentaje (0-100)
 * @returns Objeto con el índice de calor, categoría y descripción
 */
export function calculateHeatIndex(temperature: number, humidity: number): HeatIndexResult {
  // Calcular índice de calor en Fahrenheit
  const heatIndexF = calculateHeatIndexFahrenheit(temperature, humidity)
  
  // Convertir a Celsius
  const heatIndexC = fahrenheitToCelsius(heatIndexF)
  
  // Redondear a un decimal
  const value = Math.round(heatIndexC * 10) / 10
  
  // Obtener categoría y descripción
  const { category, description } = getCategoryAndDescription(value)
  
  return {
    value,
    category,
    description
  }
}
