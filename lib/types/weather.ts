// Tipos para las lecturas meteorológicas
export interface WeatherReading {
  id: string
  temperature: number
  humidity: number
  recorded_at: string
  created_at: string
}

// Tipos para los extremos diarios
export interface DailyExtremes {
  id: string
  date: string
  temp_max: number | null
  temp_min: number | null
  temp_max_time: string | null
  temp_min_time: string | null
  humidity_max: number | null
  humidity_min: number | null
  humidity_max_time: string | null
  humidity_min_time: string | null
  updated_at: string
}

// Tipo para el payload de la ESP32
export interface ESP32Payload {
  temperature: number
  humidity: number
  timestamp?: string // Opcional, si la ESP32 envía su timestamp
}

// Tipo para el índice de calor
export interface HeatIndex {
  /** Índice de calor en grados Celsius */
  value: number
  /** Categoría del índice de calor */
  category: "SEGURO" | "PRECAUCIÓN" | "PRECAUCIÓN EXTREMA" | "PELIGRO" | "PELIGRO EXTREMO" | "MÁS ALLÁ DEL UMBRAL HUMANO"
  /** Leyenda descriptiva del impacto en salud */
  description: string
}

// Tipo para la respuesta del dashboard
export interface WeatherDashboardData {
  latestReading: WeatherReading | null
  todayExtremes: DailyExtremes | null
  heatIndex: HeatIndex | null
}

// Tipo para los promedios horarios
export interface HourlyAverages{
  hour: number
  count: number
  avgTemperature: number
  avgHumidity: number
}
