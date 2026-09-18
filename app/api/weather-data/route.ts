import { type NextRequest, NextResponse } from "next/server"
import { WeatherRepository } from "@/lib/db/weather-repository"
import { calculateHeatIndex } from "@/lib/utils/functions/heat-index"
import { calculatePressureAverage, predictWeather } from "@/lib/utils/functions/predictWeather"
import { calculateITH } from "@/lib/utils/functions/ith"
import { calculateET0Hargreaves } from "@/lib/utils/functions/et0-hargreaves"
import { calculateDeltaT, calculateFrostRisk, type DerivedMetrics } from "@/lib/utils/functions/derived-metrics"
import calcularPuntoRocio from "@/lib/utils/functions/calcularPuntoRocio"
import { todayARLocalDate } from "@/lib/utils/timezone"

/**
 * GET /api/weather-data
 * Endpoint público para obtener datos del dashboard
 * Admite parámetro opcional `date=YYYY-MM-DD`
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const dateParam = searchParams.get("date")
    const todayStr = todayARLocalDate()

    // Si se especifica una fecha histórica distinta a hoy
    if (dateParam && dateParam !== todayStr) {
      const dayExtremes = await WeatherRepository.getExtremesByDate(dateParam)
      const historicalDate = new Date(`${dateParam}T12:00:00`)
      const et0 = dayExtremes ? calculateET0Hargreaves(dayExtremes.temp_max, dayExtremes.temp_min, historicalDate) : null

      return NextResponse.json({
        latestReading: null,
        todayExtremes: dayExtremes,
        heatIndex: null,
        predictions: null,
        derivedMetrics: {
          ith: null,
          et0,
          dewPoint: null,
          deltaT: null,
          frostRisk: null,
        },
        timestamp: new Date().toISOString(),
      })
    }

    const [latestReading, todayExtremes, lastReadings, pastReadings] = await Promise.all([
      WeatherRepository.getLatestReading(),
      WeatherRepository.getTodayExtremes(),
      WeatherRepository.getLastPressureReadings(4), // Últimas 4 lecturas para promedio actual
      WeatherRepository.getPressureReadingsFromHoursAgo(3, 6) // Lecturas de hace 3 horas para promedio pasado, 
    ])

    // Calcular índice de calor si hay lectura disponible
    const heatIndex = latestReading 
      ? calculateHeatIndex(latestReading.temperature, latestReading.humidity)
      : null

    // Calcular predicción del clima
    let predictions = null
    const currentAvg = calculatePressureAverage(lastReadings)
    const pastAvg = calculatePressureAverage(pastReadings)

    if (currentAvg !== null && pastAvg !== null) {
      predictions = {
        now: predictWeather(currentAvg, pastAvg)
      }
    }

    // Calcular métricas derivadas agropecuarias
    const dewPointVal = latestReading ? calcularPuntoRocio(latestReading.temperature, latestReading.humidity) : null
    const dewPoint = dewPointVal !== null ? { value: Number(dewPointVal.toFixed(1)), unit: "°C" as const } : null
    const ith = latestReading ? calculateITH(latestReading.temperature, latestReading.humidity) : null
    const et0 = todayExtremes ? calculateET0Hargreaves(todayExtremes.temp_max, todayExtremes.temp_min) : null
    const deltaT = latestReading ? calculateDeltaT(latestReading.temperature, latestReading.humidity) : null
    const frostRisk = latestReading ? calculateFrostRisk(latestReading.temperature, latestReading.humidity, dewPointVal) : null

    const derivedMetrics: DerivedMetrics = {
      ith,
      et0,
      dewPoint,
      deltaT,
      frostRisk,
    }

    return NextResponse.json({
      latestReading,
      todayExtremes,
      heatIndex,
      predictions,
      derivedMetrics,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[v0] Error fetching weather data:", error)
    return NextResponse.json({ error: "Failed to fetch weather data" }, { status: 500 })
  }
}

