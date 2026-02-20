import { NextResponse } from "next/server"
import { DayStatsRepository } from "@/lib/db/day-stats-repository"
import { createClient } from "@/lib/supabase/server"
import { AR_TZ_OFFSET_MINUTES, getUtcRangeForLocalDate, toARLocalDateString } from "@/lib/utils/timezone"

type HourlyAverage = {
  hour: number
  count: number
  avgTemperature: number
  avgHumidity: number
}

function getYesterdayARLocalDate(): string {
  const now = Date.now()
  const arMs = now - AR_TZ_OFFSET_MINUTES * 60 * 1000
  const local = new Date(arMs)
  local.setUTCDate(local.getUTCDate() - 1)

  const y = local.getUTCFullYear()
  const m = local.getUTCMonth() + 1
  const d = local.getUTCDate()

  return `${y.toString().padStart(4, "0")}-${m.toString().padStart(2, "0")}-${d
    .toString()
    .padStart(2, "0")}`
}

function addDaysToDate(date: string, days: number): string {
  const [y, m, d] = date.split("-").map((part) => Number(part))
  const next = new Date(Date.UTC(y, m - 1, d + days))
  const nextY = next.getUTCFullYear()
  const nextM = next.getUTCMonth() + 1
  const nextD = next.getUTCDate()

  return `${nextY.toString().padStart(4, "0")}-${nextM.toString().padStart(2, "0")}-${nextD
    .toString()
    .padStart(2, "0")}`
}

function isAfterDate(a: string, b: string): boolean {
  return a > b
}

export async function GET() {
  const requestId = `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`
  const prefix = `[v1-cron][req:${requestId}]`
  const targetDate = getYesterdayARLocalDate()

  console.log(`${prefix} Start daily hourly aggregation`, { targetDate })

  try {
    const supabase = await createClient()

    const { data: oldestReading, error: oldestError } = await supabase
      .from("weather_readings")
      .select("recorded_at")
      .order("recorded_at", { ascending: true })
      .limit(1)
      .maybeSingle()

    if (oldestError) {
      console.error(`${prefix} Error fetching oldest reading`, oldestError)
      return NextResponse.json(
        {
          success: false,
          stage: "fetch_oldest_reading",
          error: "Failed to fetch oldest reading",
        },
        { status: 500 }
      )
    }

    if (!oldestReading?.recorded_at) {
      console.log(`${prefix} No readings found. Nothing to process.`)
      return NextResponse.json({
        success: true,
        processedDates: [],
        skippedDates: [],
        timestamp: new Date().toISOString(),
      })
    }

    const oldestDate = toARLocalDateString(oldestReading.recorded_at)
    if (isAfterDate(oldestDate, targetDate)) {
      console.log(`${prefix} Oldest reading is today; nothing to process.`, {
        oldestDate,
        targetDate,
      })
      return NextResponse.json({
        success: true,
        processedDates: [],
        skippedDates: [],
        timestamp: new Date().toISOString(),
      })
    }

    const processedDates: string[] = []
    const skippedDates: Array<{ date: string; reason: string }> = []

    for (let date = oldestDate; !isAfterDate(date, targetDate); date = addDaysToDate(date, 1)) {
      console.log(`${prefix} Processing date`, { date })

      const hourlyAverages = await DayStatsRepository.getAveragesByHourForDate(date)

      console.log(`${prefix} Stage 1 complete: hourly averages computed`, {
        date,
        hoursWithData: hourlyAverages.length,
      })

      if (hourlyAverages.length === 0) {
        console.log(`${prefix} No readings for date. Skipping.`, { date })
        skippedDates.push({ date, reason: "no_readings" })
        continue
      }

      const { count: existingCount, error: existingError } = await supabase
        .from("hourly_stats")
        .select("hour", { count: "exact", head: true })
        .eq("date", date)

      if (existingError) {
        console.error(`${prefix} Stage 2 error: failed to check hourly_stats`, existingError)
        skippedDates.push({ date, reason: "hourly_stats_check_failed" })
        continue
      }

      if ((existingCount ?? 0) >= hourlyAverages.length) {
        console.log(`${prefix} Stage 2 skipped: hourly_stats already processed`, {
          date,
          existingCount: existingCount ?? 0,
          expected: hourlyAverages.length,
        })
      } else if ((existingCount ?? 0) > 0) {
        console.error(`${prefix} Stage 2 validation failed: partial hourly_stats detected`, {
          date,
          existingCount: existingCount ?? 0,
          expected: hourlyAverages.length,
        })
        skippedDates.push({ date, reason: "partial_hourly_stats" })
        continue
      } else {
        console.log(`${prefix} Stage 2 start: inserting hourly_stats`, {
          date,
          rows: hourlyAverages.length,
        })

        const rows = hourlyAverages.map((row: HourlyAverage) => ({
          date,
          hour: row.hour,
          count: row.count,
          avgtemperature: row.avgTemperature,
          avghumidity: row.avgHumidity,
          recorded_at: new Date().toISOString(),
        }))

        const { error: insertError } = await supabase
          .from("hourly_stats")
          .insert(rows)

        if (insertError) {
          console.error(`${prefix} Stage 2 error: failed to insert hourly_stats`, insertError)
          skippedDates.push({ date, reason: "hourly_stats_insert_failed" })
          continue
        }

        const { count: countAfter, error: countError } = await supabase
          .from("hourly_stats")
          .select("hour", { count: "exact", head: true })
          .eq("date", date)

        if (countError || (countAfter ?? 0) < hourlyAverages.length) {
          console.error(`${prefix} Stage 2 error: failed to validate hourly_stats`, {
            date,
            error: countError,
            expected: hourlyAverages.length,
            found: countAfter ?? 0,
          })
          skippedDates.push({ date, reason: "hourly_stats_validation_failed" })
          continue
        }

        console.log(`${prefix} Stage 2 complete: hourly_stats validated`, {
          date,
          expected: hourlyAverages.length,
          found: countAfter ?? 0,
        })
      }

      console.log(`${prefix} Stage 3 start: deleting weather_readings`, { date })

      const { start, end } = getUtcRangeForLocalDate(date)
      const { error: deleteError, count: deletedCount, data: deletedRows } = await supabase
        .from("weather_readings")
        .delete({ count: "exact" })
        .gte("recorded_at", start)
        .lt("recorded_at", end)

      if (deleteError) {
        console.error(`${prefix} Stage 3 error: failed to delete weather_readings`, deleteError)
        skippedDates.push({ date, reason: "weather_readings_delete_failed" })
        continue
      }

      console.log(`${prefix} Stage 3 complete: weather_readings deleted`, {
        date,
        deletedCount: deletedCount ?? deletedRows?.length ?? 0,
      })

      processedDates.push(date)
    }
    return NextResponse.json({
      success: true,
      processedDates,
      skippedDates,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error(`${prefix} Unhandled error in cron`, error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        targetDate,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
