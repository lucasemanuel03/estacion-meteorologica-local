export interface WeatherPrediction {
  deltaPressure: number
  status: string
  message: string
}

/**
 * Matriz de predicción del clima basada en presión absoluta y tendencia (ΔP 3h)
 * Filas: Nivel de presión (Baja, Normal, Alta)
 * Columnas: Tendencia (Bajando, Estable, Subiendo)
 */
const WEATHER_PREDICTION_MATRIX = {
  // Baja (< 1009 hPa)
  baja: {
    bajando: {
      status: "Alerta: Tormentas",
      message: "Alerta: Tormentas / Lluvias inminentes"
    },
    estable: {
      status: "Inestable",
      message: "Inestable / Nubosidad persistente"
    },
    subiendo: {
      status: "Mejorando",
      message: "Inestable, pero mejorando lentamente"
    }
  },
  // Normal (1010 - 1015 hPa)
  normal: {
    bajando: {
      status: "Cambio en camino",
      message: "Cambio gradual, posible deterioro en las próximas horas"
    },
    estable: {
      status: "Estable",
      message: "Clima estable / Despejado"
    },
    subiendo: {
      status: "Mejora progresiva",
      message: "Mejora progresiva en camino"
    }
  },
  // Alta (> 1016 hPa)
  alta: {
    bajando: {
      status: "Cambios en camino",
      message: "Buen tiempo, pero con cambios en camino"
    },
    estable: {
      status: "Buen tiempo",
      message: "Buen tiempo persistente / Anticiclónico"
    },
    subiendo: {
      status: "Excelente",
      message: "Buen tiempo reforzándose, condiciones óptimas"
    }
  }
} as const

/**
 * Clasifica el nivel de presión atmosférica
 */
function classifyPressureLevel(pressure: number): 'baja' | 'normal' | 'alta' {
  if (pressure < 1009) return 'baja'
  if (pressure <= 1015) return 'normal'
  return 'alta'
}

/**
 * Clasifica la tendencia de cambio de presión
 */
function classifyTrend(deltaPressure: number): 'bajando' | 'estable' | 'subiendo' {
  if (deltaPressure < -0.5) return 'bajando'
  if (deltaPressure <= 0.5) return 'estable'
  return 'subiendo'
}

/**
 * Calcula la predicción del clima basada en presión absoluta y tendencia
 * @param currentAvg - Promedio de presión actual (últimas 3 mediciones)
 * @param pastAvg - Promedio de presión de hace 3 horas
 * @returns Predicción con delta, estado y mensaje
 */
export function predictWeather(currentAvg: number, pastAvg: number): WeatherPrediction {
  const deltaPressure = Number((currentAvg - pastAvg).toFixed(1))
  
  // Clasificar presión y tendencia según la matriz
  const pressureLevel = classifyPressureLevel(currentAvg)
  const trend = classifyTrend(deltaPressure)
  
  // Obtener predicción de la matriz
  const prediction = WEATHER_PREDICTION_MATRIX[pressureLevel][trend]
  
  return {
    deltaPressure,
    status: prediction.status,
    message: prediction.message
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