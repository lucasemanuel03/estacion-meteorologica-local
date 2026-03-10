export interface WeatherPrediction {
  deltaPressure: number
  trendPressure: string
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
      message: "Aumentará las condiciones de baja presión, probable alerta de Tormentas / Lluvias inminentes"
    },
    estable: {
      status: "Inestable",
      message: "Persistira la baja presión, el clima se mantendrá Inestable / Nubosidad persistente"
    },
    subiendo: {
      status: "Mejorando",
      message: "Inestable, pero mejorando lentamente"
    }
  },
  // Normal (1010 - 1020 hPa)
  normal: {
    bajando: {
      status: "Cambio en camino",
      message: "Una zona de baja presión que provocararía desmejoras en el clima."
    },
    estable: {
      status: "Sin Cambios",
      message: "Condiciones similares a las actuales, sin cambios significativos"
    },
    subiendo: {
      status: "Mejora progresiva",
      message: "Condiciones de alta presión que mejorarían progresivamente el clima."
    }
  },
  // Alta (> 1021 hPa)
  alta: {
    bajando: {
      status: "Cambio en camino",
      message: "Buen tiempo, pero con cambios en camino"
    },
    estable: {
      status: "Buen tiempo",
      message: "Buen tiempo persistente / Anticiclónico"
    },
    subiendo: {
      status: "Excelente",
      message: "Continúen las condiciones de alta presión, se mantiene el buen clima."
    }
  }
} as const

/**
 * Clasifica el nivel de presión atmosférica
 */
function classifyPressureLevel(pressure: number): 'baja' | 'normal' | 'alta' {
  if (pressure < 1009) return 'baja'
  if (pressure <= 1020) return 'normal'
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
    trendPressure: trend,
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