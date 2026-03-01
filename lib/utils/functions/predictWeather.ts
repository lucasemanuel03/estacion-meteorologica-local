export interface WeatherPrediction {
  deltaPressure: number
  status: string
  message: string
}

/**
 * Calcula la predicción del clima basada en el cambio de presión
 * @param currentAvg - Promedio de presión actual (últimas 3 mediciones)
 * @param pastAvg - Promedio de presión de hace 3 horas
 * @returns Predicción con delta, estado y mensaje
 */
export function predictWeather(currentAvg: number, pastAvg: number): WeatherPrediction {
  const deltaPressure = Number((currentAvg - pastAvg).toFixed(1))

  if (deltaPressure > 2) {
    return {
      deltaPressure,
      status: "Mejora rápidamente",
      message: "El clima mejorará rápidamente, con cielos despejados y aire más seco."
    }
  } else if (deltaPressure > 0.5) {
    return {
      deltaPressure,
      status: "Mejora lenta",
      message: "Presión en ascenso, se espera una mejora gradual del clima para las próximas horas."
    }
  } else if (deltaPressure < -2) {
    return {
      deltaPressure,
      status: "Inestable",
      message: "Clima inestable en las próximas horas con tormentas o frentes de mal tiempo."
    }
  } else if (deltaPressure < -0.5) {
    return {
      deltaPressure,
      status: "Desmejora lenta",
      message: "Probable cambio de clima en las próximas horas con aumento de nubosidad."
    }
  } else {
    return {
      deltaPressure,
      status: "Estable",
      message: "Clima estable para las próximas horas."
    }
  }
}

/**
 * Calcula el promedio de presión de un array de lecturas
 */
export function calculatePressureAverage(readings: Array<{ pressure: number }>): number | null {
  if (readings.length === 0) return null
  
  const sum = readings.reduce((acc, reading) => acc + reading.pressure, 0)
  return Number((sum / readings.length).toFixed(2))
}