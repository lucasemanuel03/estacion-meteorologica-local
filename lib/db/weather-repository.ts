import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import type { WeatherReading, DailyExtremes, ESP32Payload, DailyWeatherStats, MonthlyWeatherSummary, MonthlyWeatherResponse, MonthComparisonStats, AnnualComparisonResponse } from "@/lib/types/weather"
import { toARLocalDateString, todayARLocalDate, getUtcRangeForLocalDate } from "@/lib/utils/timezone"
import { ConversionRepository } from "@/lib/db/conversion-repository"
import { hashApiKey } from "@/lib/security/api-key"

/**
 * Repositorio para operaciones de base de datos relacionadas con el clima
 * Separación de responsabilidades: toda la lógica de BD en un solo lugar
 */

export class WeatherRepository {

  /**
   * Obtiene la última lectura meteorológica
   */
  static async getLatestReading(): Promise<WeatherReading | null> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("weather_readings")
      .select("*")
      .order("recorded_at", { ascending: false })
      .limit(1)

    if (error) {
      console.error("[v0] Error fetching latest reading:", error)
      return null
    }

    return data && data.length > 0 ? data[0] : null
  }

  /**
   * Obtiene los extremos del día actual
   */
  static async getTodayExtremes(): Promise<DailyExtremes | null> {
    const today = todayARLocalDate()
    return this.getExtremesByDate(today)
  }

  /**
   * Obtiene los extremos para una fecha específica (YYYY-MM-DD)
   */
  static async getExtremesByDate(date: string): Promise<DailyExtremes | null> {
    const supabase = await createClient()

    const { data, error } = await supabase.from("daily_extremes").select("*").eq("date", date).limit(1)

    if (error) {
      console.error("[v0] Error fetching extremes by date:", error)
      return null
    }

    const record = data && data.length > 0 ? (data[0] as DailyExtremes) : null

    // Si no hay valor de precip_total (o es nulo/undefined/0), calcularlo a partir
    // de los eventos en `rain_events` como fallback para evitar inconsistencias.
    try {
      const needsFallback = !record || record.precip_total === null || record.precip_total === undefined || record.precip_total === 0
      if (needsFallback) {
        const { start, end } = getUtcRangeForLocalDate(date)

        const { count, error: countError } = await supabase
          .from("rain_events")
          .select("id", { count: "exact", head: true })
          .gte("recorded_at", start)
          .lt("recorded_at", end)

        if (!countError) {
          const factor = await ConversionRepository.getFactor("rain_event_v1")
          const totalMm = Math.round((Number(count ?? 0) * factor) * 100) / 100

          if (record) {
            // Anexo el valor calculado sin modificar la BD aquí
            record.precip_total = totalMm
            return record
          }

          // Si no existe registro de extremos pero hay eventos de lluvia, devolver objeto mínimo
          if (totalMm > 0) {
            return {
              id: "",
              date,
              temp_max: null,
              temp_min: null,
              temp_max_time: null,
              temp_min_time: null,
              humidity_max: null,
              humidity_min: null,
              humidity_max_time: null,
              humidity_min_time: null,
              precip_total: totalMm,
              last_value: null,
              updated_at: new Date().toISOString(),
            }
          }
        }
      }
    } catch (err) {
      console.error("[v0] Error computing fallback precip_total:", err)
    }

    return record
  }

  /**
   * Obtiene las ultimas N extremos diarios
   */

  static async getRecentExtremes(limit: number = 7): Promise<DailyExtremes[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("daily_extremes")
      .select("*")
      .order("date", { ascending: false })
      .limit(limit)

    if (error) {
      console.error("[v0] Error fetching recent extremes:", error)
      return []
    }

    return data || []
  }

  /**
   * :: PRESIÓN ATMOSFÉRICA ::
   * 
  * Obtiene las últimas N lecturas de presión
  */
  static async getLastPressureReadings(limit: number) {
    
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from("weather_readings")
      .select("pressure, recorded_at")
      .not("pressure", "is", null)
      .order("recorded_at", { ascending: false })
      .limit(limit)

    if (error) throw error
    return data || []
  }

  /**
   * Obtiene lecturas de hace aproximadamente N horas
   */
  static async getPressureReadingsFromHoursAgo(hours: number, limit: number = 10) {
    const supabase = await createClient()
    const targetTime = new Date()
    targetTime.setHours(targetTime.getHours() - hours)
    
    // Rango de ±15 minutos alrededor del tiempo objetivo
    const startTime = new Date(targetTime.getTime() - 30 * 60 * 1000)
    const endTime = new Date(targetTime.getTime() + 30 * 60 * 1000)

    const { data, error } = await supabase
      .from("weather_readings")
      .select("pressure, recorded_at")
      .not("pressure", "is", null)
      .gte("recorded_at", startTime.toISOString())
      .lte("recorded_at", endTime.toISOString())
      .order("recorded_at", { ascending: false })
      .limit(limit)

    if (error) throw error
    return data || []
  }


  /**
   * Inserta una nueva lectura meteorológica
   */
  static async insertReading(payload: ESP32Payload): Promise<WeatherReading | null> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("weather_readings")
      .insert({
        temperature: payload.temperature,
        humidity: payload.humidity,
        altitude: payload.altitude ?? null,
        pressure: payload.pressure || null,
        recorded_at: payload.timestamp || new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Error inserting reading:", error)
      return null
    }

    return data
  }

  /**
   * Actualiza o crea los extremos diarios si es necesario
   */
  static async updateDailyExtremes(
    reading: WeatherReading,
    context?: { requestId?: string; source?: string },
  ): Promise<void> {
    try {
      const supabase = await createClient()
      // Hotfix: calcular el día local AR (UTC-3) para evitar cruzar fechas
      const date = toARLocalDateString(reading.recorded_at)
      const prefix = `[v1-extremes][req:${context?.requestId ?? "n/a"}][${context?.source ?? "unknown"}]`
      const startedAt = Date.now()

      console.log(`${prefix} Start updateDailyExtremes`, {
        readingId: reading.id,
        recorded_at: reading.recorded_at,
        temp: reading.temperature,
        humidity: reading.humidity,
        date, // fecha local AR
      })

      // Obtener extremos actuales del día
      const { data: currentExtremes, error: fetchError } = await supabase
        .from("daily_extremes")
        .select("*")
        .eq("date", date)
        .maybeSingle()

      if (fetchError && fetchError.code !== "PGRST116") {
        console.error(`${prefix} Error fetching daily extremes:`, fetchError)
        return
      }

      console.log(`${prefix} Current extremes`, currentExtremes ?? "none")

      const updates: Partial<DailyExtremes> = {}

      // Verificar temperatura máxima
      if (!currentExtremes?.temp_max || reading.temperature > currentExtremes.temp_max) {
        updates.temp_max = reading.temperature
        updates.temp_max_time = reading.recorded_at
      }

      // Verificar temperatura mínima
      if (!currentExtremes?.temp_min || reading.temperature < currentExtremes.temp_min) {
        updates.temp_min = reading.temperature
        updates.temp_min_time = reading.recorded_at
      }

      // Verificar humedad máxima
      if (!currentExtremes?.humidity_max || reading.humidity > currentExtremes.humidity_max) {
        updates.humidity_max = reading.humidity
        updates.humidity_max_time = reading.recorded_at
      }

      // Verificar humedad mínima
      if (!currentExtremes?.humidity_min || reading.humidity < currentExtremes.humidity_min) {
        updates.humidity_min = reading.humidity
        updates.humidity_min_time = reading.recorded_at
      }

      // Solo actualizar si hay cambios
      if (Object.keys(updates).length > 0) {
        updates.updated_at = new Date().toISOString()

        console.log(`${prefix} Applying updates`, updates)

        if (currentExtremes) {
          // Si existe registro para hoy, actualizar
          const { error: updateError } = await supabase
            .from("daily_extremes")
            .update(updates)
            .eq("date", date)

          if (updateError) {
            console.error(`${prefix} Error updating daily extremes:`, updateError)
          } else {
            console.log(`${prefix} Updated daily extremes for date ${date}`)
          }
        } else {
          // Si no existe registro, crear uno nuevo
          const { error: insertError } = await supabase.from("daily_extremes").insert({
            date,
            ...updates,
          })

          if (insertError) {
            console.error(`${prefix} Error inserting daily extremes:`, insertError)
          } else {
            console.log(`${prefix} Inserted daily extremes for date ${date}`)
          }
        }
      } else {
        console.log(`${prefix} No updates needed for date ${date}`)
      }

      console.log(`${prefix} Finished in ${Date.now() - startedAt}ms`)
    } catch (error) {
      console.error("[v1-extremes] Error in updateDailyExtremes:", error)
    }
  }

  /**
   * Verifica si una API key es válida
   */
  static async validateApiKey(apiKey: string): Promise<boolean> {
    const supabase = createAdminClient()
    const apiKeyHash = hashApiKey(apiKey)

    const { data, error } = await supabase
      .from("api_keys")
      .select("id,is_active")
      .eq("key_hash", apiKeyHash)
      .eq("is_active", true)
      .single()

    if (error || !data) {
      return false
    }

    // Actualizar last_used_at
    await supabase
      .from("api_keys")
      .update({ last_used_at: new Date().toISOString() })
      .eq("id", data.id)

    return true
  }

  /**
   * Obtiene estadísticas consolidadas para un mes y año específico
   */
  static async getMonthlyWeatherStats(
    year: number,
    month: number,
  ): Promise<MonthlyWeatherResponse> {
    const supabase = await createClient()

    // Formatear rango de fechas YYYY-MM-01 a YYYY-MM-31 (o fin de mes)
    const startDate = `${year}-${month.toString().padStart(2, "0")}-01`
    const lastDayOfMonth = new Date(year, month, 0).getDate()
    const endDate = `${year}-${month.toString().padStart(2, "0")}-${lastDayOfMonth
      .toString()
      .padStart(2, "0")}`

    // 1. Consultar daily_extremes para el mes
    const { data: extremesData, error: extremesError } = await supabase
      .from("daily_extremes")
      .select("*")
      .gte("date", startDate)
      .lte("date", endDate)
      .order("date", { ascending: true })

    if (extremesError) {
      console.error("[weather-repo] Error fetching monthly extremes:", extremesError)
    }

    // 2. Consultar hourly_stats para promedios por día en el mes
    const { data: hourlyData, error: hourlyError } = await supabase
      .from("hourly_stats")
      .select("date, avgtemperature, avghumidity")
      .gte("date", startDate)
      .lte("date", endDate)

    if (hourlyError) {
      console.error("[weather-repo] Error fetching monthly hourly stats:", hourlyError)
    }

    // Mapear promedios de hourly_stats por día
    const hourlyMap = new Map<string, { tempSum: number; humSum: number; count: number }>()
    if (hourlyData) {
      for (const row of hourlyData) {
        if (!hourlyMap.has(row.date)) {
          hourlyMap.set(row.date, { tempSum: 0, humSum: 0, count: 0 })
        }
        const current = hourlyMap.get(row.date)!
        current.tempSum += Number(row.avgtemperature ?? 0)
        current.humSum += Number(row.avghumidity ?? 0)
        current.count += 1
      }
    }

    const daysMap: Record<string, DailyWeatherStats> = {}
    const extremes = extremesData || []

    let monthTempMax: number | null = null
    let monthTempMaxDate: string | null = null
    let monthTempMin: number | null = null
    let monthTempMinDate: string | null = null
    let totalPrecip = 0
    let totalHumSum = 0
    let totalHumCount = 0
    let daysWithDataCount = 0

    for (const record of extremes) {
      const date = record.date
      const hourlyInfo = hourlyMap.get(date)

      const tMax = record.temp_max !== null ? Number(record.temp_max) : null
      const tMin = record.temp_min !== null ? Number(record.temp_min) : null
      const hMax = record.humidity_max !== null ? Number(record.humidity_max) : null
      const hMin = record.humidity_min !== null ? Number(record.humidity_min) : null
      const precip = record.precip_total !== null ? Number(record.precip_total) : 0

      const tempAvg = hourlyInfo && hourlyInfo.count > 0
        ? Math.round((hourlyInfo.tempSum / hourlyInfo.count) * 10) / 10
        : (tMax !== null && tMin !== null ? Math.round(((tMax + tMin) / 2) * 10) / 10 : null)

      const humAvg = hourlyInfo && hourlyInfo.count > 0
        ? Math.round((hourlyInfo.humSum / hourlyInfo.count) * 10) / 10
        : (hMax !== null && hMin !== null ? Math.round(((hMax + hMin) / 2) * 10) / 10 : hMax)

      daysMap[date] = {
        date,
        temp_max: tMax,
        temp_min: tMin,
        temp_avg: tempAvg,
        humidity_max: hMax,
        humidity_min: hMin,
        humidity_avg: humAvg,
        precip_total: precip,
        has_data: true,
      }

      daysWithDataCount++

      if (tMax !== null) {
        if (monthTempMax === null || tMax > monthTempMax) {
          monthTempMax = tMax
          monthTempMaxDate = date
        }
      }
      if (tMin !== null) {
        if (monthTempMin === null || tMin < monthTempMin) {
          monthTempMin = tMin
          monthTempMinDate = date
        }
      }
      if (precip > 0) {
        totalPrecip += precip
      }
      if (humAvg !== null) {
        totalHumSum += humAvg
        totalHumCount++
      }
    }

    const monthHumidityAvg = totalHumCount > 0
      ? Math.round((totalHumSum / totalHumCount) * 10) / 10
      : null

    return {
      summary: {
        year,
        month,
        temp_max: monthTempMax,
        temp_max_date: monthTempMaxDate,
        temp_min: monthTempMin,
        temp_min_date: monthTempMinDate,
        humidity_avg: monthHumidityAvg,
        precip_total: Math.round(totalPrecip * 100) / 100,
        days_with_data: daysWithDataCount,
      },
      days: daysMap,
    }
  }

  /**
   * Obtiene la comparativa de todos los meses de un año específico
   */
  static async getAnnualComparisonStats(
    year: number,
  ): Promise<AnnualComparisonResponse> {
    const supabase = await createClient()

    const todayStr = todayARLocalDate()
    const [currentYear, currentMonthNum] = todayStr.split("-").map(Number)

    // Determinar hasta qué mes mostrar
    // Si el año es el actual, se muestran los meses hasta currentMonthNum
    // Si el año es pasado, se muestran los 12 meses
    // Si el año es futuro, se muestran 0 meses
    let maxMonth = 12
    if (year === currentYear) {
      maxMonth = currentMonthNum
    } else if (year > currentYear) {
      maxMonth = 0
    }

    const startDate = `${year}-01-01`
    const endDate = `${year}-12-31`

    const MONTH_NAMES = [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ]

    // 1. Consultar daily_extremes del año
    const { data: extremesData, error: extremesError } = await supabase
      .from("daily_extremes")
      .select("date, temp_max, temp_min, humidity_max, humidity_min, precip_total")
      .gte("date", startDate)
      .lte("date", endDate)

    if (extremesError) {
      console.error("[weather-repo] Error fetching annual extremes:", extremesError)
    }

    // 2. Consultar hourly_stats del año
    const { data: hourlyData, error: hourlyError } = await supabase
      .from("hourly_stats")
      .select("date, avgtemperature, avghumidity")
      .gte("date", startDate)
      .lte("date", endDate)

    if (hourlyError) {
      console.error("[weather-repo] Error fetching annual hourly stats:", hourlyError)
    }

    // Agrupar por mes (1..maxMonth)
    const extremesByMonth = new Map<number, typeof extremesData>()
    const hourlyByMonth = new Map<number, typeof hourlyData>()

    if (extremesData) {
      for (const row of extremesData) {
        const m = parseInt(row.date.split("-")[1], 10)
        if (!extremesByMonth.has(m)) extremesByMonth.set(m, [])
        extremesByMonth.get(m)!.push(row)
      }
    }

    if (hourlyData) {
      for (const row of hourlyData) {
        const m = parseInt(row.date.split("-")[1], 10)
        if (!hourlyByMonth.has(m)) hourlyByMonth.set(m, [])
        hourlyByMonth.get(m)!.push(row)
      }
    }

    const monthsResult: MonthComparisonStats[] = []
    let totalYearRecords = 0

    for (let m = 1; m <= maxMonth; m++) {
      const monthExtremes = extremesByMonth.get(m) || []
      const monthHourly = hourlyByMonth.get(m) || []

      const hasData = monthExtremes.length > 0 || monthHourly.length > 0
      if (hasData) {
        totalYearRecords += monthExtremes.length
      }

      let tMax: number | null = null
      let tMaxDate: string | null = null
      let tMin: number | null = null
      let tMinDate: string | null = null
      let precipTotal = 0
      let maxDailyPrecip: number | null = null
      let maxDailyPrecipDate: string | null = null
      let rainyDaysCount = 0

      for (const r of monthExtremes) {
        if (r.temp_max !== null) {
          const val = Number(r.temp_max)
          if (tMax === null || val > tMax) {
            tMax = val
            tMaxDate = r.date
          }
        }
        if (r.temp_min !== null) {
          const val = Number(r.temp_min)
          if (tMin === null || val < tMin) {
            tMin = val
            tMinDate = r.date
          }
        }
        if (r.precip_total !== null && Number(r.precip_total) > 0) {
          const pVal = Number(r.precip_total)
          precipTotal += pVal
          rainyDaysCount++
          if (maxDailyPrecip === null || pVal > maxDailyPrecip) {
            maxDailyPrecip = pVal
            maxDailyPrecipDate = r.date
          }
        }
      }

      // Promedios desde hourly_stats
      let tAvgSum = 0
      let hAvgSum = 0
      let hCount = 0

      for (const h of monthHourly) {
        if (h.avgtemperature !== null) tAvgSum += Number(h.avgtemperature)
        if (h.avghumidity !== null) hAvgSum += Number(h.avghumidity)
        hCount++
      }

      let tempAvg = hCount > 0 ? Math.round((tAvgSum / hCount) * 10) / 10 : null
      let humAvg = hCount > 0 ? Math.round((hAvgSum / hCount) * 10) / 10 : null

      // Fallback si no hay registros en hourly_stats para este mes
      if (tempAvg === null && monthExtremes.length > 0) {
        let dayTempSum = 0
        let dayTempCount = 0
        for (const r of monthExtremes) {
          if (r.temp_max !== null && r.temp_min !== null) {
            dayTempSum += (Number(r.temp_max) + Number(r.temp_min)) / 2
            dayTempCount++
          }
        }
        if (dayTempCount > 0) {
          tempAvg = Math.round((dayTempSum / dayTempCount) * 10) / 10
        }
      }

      if (humAvg === null && monthExtremes.length > 0) {
        let dayHumSum = 0
        let dayHumCount = 0
        for (const r of monthExtremes) {
          if (r.humidity_max !== null && r.humidity_min !== null) {
            dayHumSum += (Number(r.humidity_max) + Number(r.humidity_min)) / 2
            dayHumCount++
          } else if (r.humidity_max !== null) {
            dayHumSum += Number(r.humidity_max)
            dayHumCount++
          }
        }
        if (dayHumCount > 0) {
          humAvg = Math.round((dayHumSum / dayHumCount) * 10) / 10
        }
      }

      monthsResult.push({
        month: m,
        monthName: MONTH_NAMES[m - 1],
        temp_avg: tempAvg,
        temp_max: tMax,
        temp_max_date: tMaxDate,
        temp_min: tMin,
        temp_min_date: tMinDate,
        humidity_avg: humAvg,
        precip_total: hasData ? Math.round(precipTotal * 100) / 100 : null,
        max_daily_precip: maxDailyPrecip !== null ? Math.round(maxDailyPrecip * 100) / 100 : null,
        max_daily_precip_date: maxDailyPrecipDate,
        rainy_days_count: rainyDaysCount,
        days_with_data: monthExtremes.length,
        has_data: hasData,
      })
    }

    return {
      year,
      months: monthsResult,
      has_data: totalYearRecords > 0,
    }
  }
}


