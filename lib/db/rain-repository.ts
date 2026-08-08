import { createClient } from "../supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import type { RainEvent, RainEventInsert } from "@/lib/types/rain"
import { getUtcRangeForLocalDate, toARLocalDateString } from "@/lib/utils/timezone"
import { ConversionRepository } from "@/lib/db/conversion-repository"

type RainCleanupProcessedDate = {
  date: string
  deletedCount: number
  eventsCount: number
  expectedPrecipMm: number
  precipBefore: number | null
  precipAfter: number
}

type RainCleanupSkippedDate = {
  date: string
  reason: string
}

type RainCleanupResult = {
  targetDate: string
  factor: number
  processedDates: RainCleanupProcessedDate[]
  skippedDates: RainCleanupSkippedDate[]
}

function round2(value: number): number {
  return Math.round(value * 100) / 100
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

function getYesterdayARLocalDate(): string {
  const now = Date.now()
  const offsetMinutes = 3 * 60
  const arMs = now - offsetMinutes * 60 * 1000
  const local = new Date(arMs)
  local.setUTCDate(local.getUTCDate() - 1)

  const y = local.getUTCFullYear()
  const m = local.getUTCMonth() + 1
  const d = local.getUTCDate()

  return `${y.toString().padStart(4, "0")}-${m.toString().padStart(2, "0")}-${d
    .toString()
    .padStart(2, "0")}`
}

export class RainRepository {
  static async deleteTodayEvents(): Promise<{ deletedCount: number; date: string } | null> {
    const supabase = createAdminClient()
    const { start, end, localDate } = getUtcRangeForLocalDate()

    const { error, count } = await supabase
      .from("rain_events")
      .delete({ count: "exact" })
      .gte("recorded_at", start)
      .lt("recorded_at", end)

    if (error) {
      console.error("[rain] Error deleting today events:", error)
      return null
    }

    const deletedCount = count ?? 0

    const { error: upsertError } = await supabase.from("daily_extremes").upsert(
      { date: localDate, precip_total: 0, updated_at: new Date().toISOString() },
      { onConflict: "date" },
    )

    if (upsertError) {
      console.error("[rain] Error resetting daily_extremes precip_total after delete:", upsertError)
      return null
    }

    return { deletedCount, date: localDate }
  }

  static async insertEvents(events: RainEventInsert[]): Promise<RainEvent[] | null> {
    if (events.length === 0) {
      return []
    }

    const supabase = createAdminClient()

    const { data, error } = await supabase.from("rain_events").insert(events).select()

    if (error) {
      console.error("[rain] Error inserting events:", error)
      return null
    }

    try {
      // Obtener factor de conversión (mm por evento)
      const factor = await ConversionRepository.getFactor("rain_event_v1")

      // Agrupar fechas locales afectadas por los eventos insertados
      const affectedDates = new Set<string>()
      const insertedCountByDate = new Map<string, number>()
      ;(data || []).forEach((e: RainEvent) => {
        const localDate = toARLocalDateString(e.recorded_at)
        affectedDates.add(localDate)
        insertedCountByDate.set(localDate, (insertedCountByDate.get(localDate) ?? 0) + 1)
      })

      const client = await createClient()

      for (const date of Array.from(affectedDates)) {
        const { start, end } = getUtcRangeForLocalDate(date)

        // Contar eventos en la DB para esa fecha (fuente de verdad)
        const { count, error: countError } = await client
          .from("rain_events")
          .select("id", { count: "exact", head: true })
          .gte("recorded_at", start)
          .lt("recorded_at", end)

        if (countError) {
          console.error("[rain] Error counting events for date", date, countError)
          continue
        }

        const totalEvents = (count ?? 0) as number
        const recountedMm = round2(totalEvents * factor)
        const insertedCount = insertedCountByDate.get(date) ?? 0
        const insertedMm = round2(insertedCount * factor)

        const { data: existingExtreme, error: extremeReadError } = await supabase
          .from("daily_extremes")
          .select("precip_total")
          .eq("date", date)
          .maybeSingle()

        if (extremeReadError) {
          console.error("[rain] Error reading current daily_extremes for date", date, extremeReadError)
          continue
        }

        const existingPrecip =
          existingExtreme?.precip_total === null || existingExtreme?.precip_total === undefined
            ? 0
            : Number(existingExtreme.precip_total)

        // Regla de seguridad: jamás reducir precip_total por purgas o llegadas tardías.
        const totalMm = round2(Math.max(recountedMm, existingPrecip + insertedMm))

        console.log(`[rain] Factor de conversión: ${factor} mm por evento`)
        console.log(
          `[rain] Processed date ${date}: events=${totalEvents}, recounted=${recountedMm} mm, existing=${existingPrecip} mm, inserted=${insertedMm} mm, final=${totalMm} mm`,
        )

        // Upsert en daily_extremes para mantener precip_total
        const { error: upsertError } = await supabase.from("daily_extremes").upsert(
          { date, precip_total: totalMm, updated_at: new Date().toISOString() },
          { onConflict: "date" },
        )

        if (upsertError) {
          console.error("[rain] Error upserting daily_extremes for date", date, upsertError)
        } else {
          console.log(`[rain] Updated daily_extremes ${date} precip_total=${totalMm}`)
        }
      }
    } catch (err) {
      console.error("[rain] Unexpected error processing inserted events:", err)
    }

    return data
  }

  static async cleanupPastEventsWithVerification(): Promise<RainCleanupResult | null> {
    const supabase = createAdminClient()
    const targetDate = getYesterdayARLocalDate()
    const factor = await ConversionRepository.getFactor("rain_event_v1")

    const { data: oldestEvent, error: oldestError } = await supabase
      .from("rain_events")
      .select("recorded_at")
      .order("recorded_at", { ascending: true })
      .limit(1)
      .maybeSingle()

    if (oldestError) {
      console.error("[rain-cleanup] Error fetching oldest rain event:", oldestError)
      return null
    }

    if (!oldestEvent?.recorded_at) {
      return {
        targetDate,
        factor,
        processedDates: [],
        skippedDates: [],
      }
    }

    const oldestDate = toARLocalDateString(oldestEvent.recorded_at)
    if (isAfterDate(oldestDate, targetDate)) {
      return {
        targetDate,
        factor,
        processedDates: [],
        skippedDates: [],
      }
    }

    const processedDates: RainCleanupProcessedDate[] = []
    const skippedDates: RainCleanupSkippedDate[] = []

    for (let date = oldestDate; !isAfterDate(date, targetDate); date = addDaysToDate(date, 1)) {
      const { start, end } = getUtcRangeForLocalDate(date)

      const { count: eventsCount, error: countError } = await supabase
        .from("rain_events")
        .select("id", { count: "exact", head: true })
        .gte("recorded_at", start)
        .lt("recorded_at", end)

      if (countError) {
        console.error("[rain-cleanup] Error counting events:", { date, error: countError })
        skippedDates.push({ date, reason: "count_failed" })
        continue
      }

      const safeEventsCount = Number(eventsCount ?? 0)
      if (safeEventsCount === 0) {
        skippedDates.push({ date, reason: "no_events" })
        continue
      }

      const expectedPrecipMm = round2(safeEventsCount * factor)

      const { data: existingExtreme, error: readExtremeError } = await supabase
        .from("daily_extremes")
        .select("precip_total")
        .eq("date", date)
        .maybeSingle()

      if (readExtremeError) {
        console.error("[rain-cleanup] Error reading daily_extremes:", { date, error: readExtremeError })
        skippedDates.push({ date, reason: "daily_extremes_read_failed" })
        continue
      }

      const precipBefore =
        existingExtreme?.precip_total === null || existingExtreme?.precip_total === undefined
          ? null
          : Number(existingExtreme.precip_total)

      const precipTarget = round2(Math.max(precipBefore ?? 0, expectedPrecipMm))

      if (precipBefore === null || round2(precipBefore) !== precipTarget) {
        const { error: upsertError } = await supabase.from("daily_extremes").upsert(
          { date, precip_total: precipTarget, updated_at: new Date().toISOString() },
          { onConflict: "date" },
        )

        if (upsertError) {
          console.error("[rain-cleanup] Error upserting daily_extremes:", { date, error: upsertError })
          skippedDates.push({ date, reason: "daily_extremes_upsert_failed" })
          continue
        }
      }

      const { data: verifiedExtreme, error: verifyError } = await supabase
        .from("daily_extremes")
        .select("precip_total")
        .eq("date", date)
        .maybeSingle()

      if (verifyError) {
        console.error("[rain-cleanup] Error verifying daily_extremes:", { date, error: verifyError })
        skippedDates.push({ date, reason: "daily_extremes_verify_failed" })
        continue
      }

      const precipAfter =
        verifiedExtreme?.precip_total === null || verifiedExtreme?.precip_total === undefined
          ? null
          : Number(verifiedExtreme.precip_total)

      if (precipAfter === null || round2(precipAfter) < expectedPrecipMm) {
        skippedDates.push({ date, reason: "daily_extremes_not_safe_to_delete" })
        continue
      }

      const { error: deleteError, count: deletedCount } = await supabase
        .from("rain_events")
        .delete({ count: "exact" })
        .gte("recorded_at", start)
        .lt("recorded_at", end)

      if (deleteError) {
        console.error("[rain-cleanup] Error deleting rain events:", { date, error: deleteError })
        skippedDates.push({ date, reason: "delete_failed" })
        continue
      }

      const { count: remainingCount, error: remainingError } = await supabase
        .from("rain_events")
        .select("id", { count: "exact", head: true })
        .gte("recorded_at", start)
        .lt("recorded_at", end)

      if (remainingError) {
        console.error("[rain-cleanup] Error verifying deletion:", { date, error: remainingError })
        skippedDates.push({ date, reason: "post_delete_check_failed" })
        continue
      }

      if (Number(remainingCount ?? 0) > 0) {
        skippedDates.push({ date, reason: "post_delete_not_empty" })
        continue
      }

      processedDates.push({
        date,
        deletedCount: Number(deletedCount ?? 0),
        eventsCount: safeEventsCount,
        expectedPrecipMm,
        precipBefore,
        precipAfter,
      })
    }

    return {
      targetDate,
      factor,
      processedDates,
      skippedDates,
    }
  }

  static async getTodayEvents(): Promise<RainEvent[] | null> {
    const supabase = await createClient()
    const { start, end } = getUtcRangeForLocalDate()

    const { data, error } = await supabase
      .from("rain_events")
      .select("*")
      .gte("recorded_at", start)
      .lt("recorded_at", end)
      .order("recorded_at", { ascending: true })

    if (error) {
      console.error("[rain] Error fetching today events:", error)
      return null
    }

    return data || []
  }

  static async getRecentEvents(limit: number): Promise<RainEvent[] | null> {
    const supabase = await createClient()
    const safeLimit = Math.min(Math.max(Math.floor(limit), 1), 100)

    const { data, error } = await supabase
      .from("rain_events")
      .select("*")
      .order("recorded_at", { ascending: false })
      .limit(safeLimit)

    if (error) {
      console.error("[rain] Error fetching recent events:", error)
      return null
    }

    return data || []
  }
}
