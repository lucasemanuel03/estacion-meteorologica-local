import { createClient } from "../supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import type { RainEvent, RainEventInsert } from "@/lib/types/rain"
import { getUtcRangeForLocalDate, toARLocalDateString } from "@/lib/utils/timezone"
import { ConversionRepository } from "@/lib/db/conversion-repository"

export class RainRepository {
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
      const factor = await ConversionRepository.getFactor("rain_event_test")

      // Agrupar fechas locales afectadas por los eventos insertados
      const affectedDates = new Set<string>()
      ;(data || []).forEach((e: RainEvent) => {
        const localDate = toARLocalDateString(e.recorded_at)
        affectedDates.add(localDate)
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
        const totalMm = Math.round((totalEvents * factor) * 100) / 100 // 2 decimales

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
