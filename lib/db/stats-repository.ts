import { createClient } from "../supabase/server"
import type { WeatherReading } from "../types/weather"
import { getUtcRangeForLocalDate, getARLocalHour } from "@/lib/utils/timezone"

export class StatsRepository {
  /**
   * Obtiene todas las mediciones del día actual
   * Retorna ordenadas de más antiguas a más recientes
   */
  static async getTodayReadings(): Promise<WeatherReading[]> {
    const supabase = await createClient()
    const { start, end } = getUtcRangeForLocalDate()

    const { data, error } = await supabase
      .from("weather_readings")
      .select("*")
      .gte("recorded_at", start)
      .lt("recorded_at", end)
      .order("recorded_at", { ascending: true })

    if (error) {
      console.error("[v1-stats] Error fetching today readings:", error)
      return []
    }

    return data || []
  }

  /**
   * Obtiene todas las mediciones para un día específico
   * Retorna ordenadas de más antiguas a más recientes
   * 
   * @param date - Formato: YYYY-MM-DD
   */
  static async getReadingsByDate(date: string): Promise<WeatherReading[]> {
    const supabase = await createClient()
    const { start, end } = getUtcRangeForLocalDate(date)

    const { data, error } = await supabase
      .from("weather_readings")
      .select("*")
      .gte("recorded_at", start)
      .lt("recorded_at", end)
      .order("recorded_at", { ascending: true })

    if (error) {
      console.error("[v1-stats] Error fetching readings for date:", error)
      return []
    }

    return data || []
  }

  /**
   * Obtiene los promedios de temperatura y humedad por hora para el día actual
   * Agrupa todas las mediciones por hora y calcula el promedio para cada una
   */
  static async getTodayAveragesByHour(): Promise<
    Array<{
      hour: number
      count: number
      avgTemperature: number
      avgHumidity: number
    }>
  > {
    const readings = await this.getTodayReadings()

    if (readings.length === 0) {
      return []
    }

    // Agrupar por hora
    const hourlyMap = new Map<
      number,
      { temps: number[]; humidities: number[] }
    >()

    readings.forEach((reading) => {
      const hour = getARLocalHour(reading.recorded_at)

      if (!hourlyMap.has(hour)) {
        hourlyMap.set(hour, { temps: [], humidities: [] })
      }

      const hourData = hourlyMap.get(hour)!
      hourData.temps.push(reading.temperature)
      hourData.humidities.push(reading.humidity)
    })

    // Calcular promedios por hora
    const result: Array<{
      hour: number
      count: number
      avgTemperature: number
      avgHumidity: number
    }> = []

    for (let hour = 0; hour < 24; hour++) {
      const hourData = hourlyMap.get(hour)

      if (hourData) {
        const avgTemp =
          hourData.temps.reduce((a, b) => a + b, 0) / hourData.temps.length
        const avgHumidity =
          hourData.humidities.reduce((a, b) => a + b, 0) /
          hourData.humidities.length

        result.push({
          hour,
          count: hourData.temps.length,
          avgTemperature: Math.round(avgTemp * 100) / 100, // 2 decimales
          avgHumidity: Math.round(avgHumidity * 100) / 100, // 2 decimales
        })
      }
    }

    return result
  }

  /**
   * Obtiene los promedios de temperatura y humedad por hora para un día específico
   * 
   * @param date - Formato: YYYY-MM-DD
   */
  static async getAveragesByHourForDate(
    date: string,
  ): Promise<
    Array<{
      hour: number
      count: number
      avgTemperature: number
      avgHumidity: number
    }>
  > {
    const readings = await this.getReadingsByDate(date)

    if (readings.length === 0) {
      return []
    }

    // Agrupar por hora
    const hourlyMap = new Map<
      number,
      { temps: number[]; humidities: number[] }
    >()

    readings.forEach((reading) => {
      const hour = getARLocalHour(reading.recorded_at)

      if (!hourlyMap.has(hour)) {
        hourlyMap.set(hour, { temps: [], humidities: [] })
      }

      const hourData = hourlyMap.get(hour)!
      hourData.temps.push(reading.temperature)
      hourData.humidities.push(reading.humidity)
    })

    // Calcular promedios por hora
    const result: Array<{
      hour: number
      count: number
      avgTemperature: number
      avgHumidity: number
    }> = []

    for (let hour = 0; hour < 24; hour++) {
      const hourData = hourlyMap.get(hour)

      if (hourData) {
        const avgTemp =
          hourData.temps.reduce((a, b) => a + b, 0) / hourData.temps.length
        const avgHumidity =
          hourData.humidities.reduce((a, b) => a + b, 0) /
          hourData.humidities.length

        result.push({
          hour,
          count: hourData.temps.length,
          avgTemperature: Math.round(avgTemp * 100) / 100, // 2 decimales
          avgHumidity: Math.round(avgHumidity * 100) / 100, // 2 decimales
        })
      }
    }

    return result
  }

  /**
   * Calcula la tendencia comparando las últimas N lecturas vs las N anteriores
   * Devuelve el diferencial y un mensaje según un umbral de estabilidad
   */
  static async getTrend(options?: { windowSize?: number; threshold?: number }): Promise<{
    tempTrend: { differential: number; message: string }
    humTrend: { differential: number; message: string }
  }> {
    const windowSize = Math.max(1, Math.floor(options?.windowSize ?? 2))
    const threshold = options?.threshold ?? 0.2

    const supabase = await createClient()
    const limit = windowSize * 2

    const { data, error } = await supabase
      .from("weather_readings")
      .select("temperature, humidity, recorded_at")
      .order("recorded_at", { ascending: false })
      .limit(limit)

    if (error) {
      console.error("[v1-stats] Error fetching readings for trend:", error)
      return {
        tempTrend: { differential: 0, message: "Error al calcular tendencia" },
        humTrend: { differential: 0, message: "Error al calcular tendencia" },
      }
    }

    if (!data || data.length < limit) {
      return {
        tempTrend: { differential: 0, message: "No hay suficientes datos" },
        humTrend: { differential: 0, message: "No hay suficientes datos" },
      }
    }

    const latest = data.slice(0, windowSize)
    const previous = data.slice(windowSize, limit)

    const avg = (arr: typeof data, key: "temperature" | "humidity") =>
      arr.reduce((sum, item) => sum + (item[key] ?? 0), 0) / arr.length

    const tempDiff = Number((avg(latest, "temperature") - avg(previous, "temperature")).toFixed(2))
    const humDiff = Number((avg(latest, "humidity") - avg(previous, "humidity")).toFixed(2))

    const trendMessage = (diff: number, label: string) => {
      if (Math.abs(diff) <= threshold) return `${label} estable`
      return diff > 0 ? `${label} en aumento` : `${label} en descenso`
    }

    return {
      tempTrend: { differential: tempDiff, message: trendMessage(tempDiff, "Temperatura") },
      humTrend: { differential: humDiff, message: trendMessage(humDiff, "Humedad") },
    }
  }
}