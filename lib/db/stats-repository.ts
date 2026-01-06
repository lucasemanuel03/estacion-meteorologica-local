import { createClient } from "../supabase/server"
import type { WeatherReading } from "../types/weather"

export class StatsRepository {
  /**
   * Obtiene todas las mediciones del día actual
   * Retorna ordenadas de más antiguas a más recientes
   */
  static async getTodayReadings(): Promise<WeatherReading[]> {
    const supabase = await createClient()
    const today = new Date().toISOString().split("T")[0]

    const { data, error } = await supabase
      .from("weather_readings")
      .select("*")
      .gte("recorded_at", `${today}T00:00:00Z`)
      .lt("recorded_at", `${today}T23:59:59Z`)
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

    const { data, error } = await supabase
      .from("weather_readings")
      .select("*")
      .gte("recorded_at", `${date}T00:00:00Z`)
      .lt("recorded_at", `${date}T23:59:59Z`)
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
      const hour = new Date(reading.recorded_at).getUTCHours()

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
      const hour = new Date(reading.recorded_at).getUTCHours()

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
}