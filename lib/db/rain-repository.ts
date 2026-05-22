import { createClient } from "../supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import type { RainEvent, RainEventInsert } from "@/lib/types/rain"
import { getUtcRangeForLocalDate } from "@/lib/utils/timezone"

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
