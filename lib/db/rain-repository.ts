import { createClient } from "@/lib/supabase/server"
import type { RainEvent, RainEventInsert } from "@/lib/types/rain"

export class RainRepository {
  static async insertEvents(events: RainEventInsert[]): Promise<RainEvent[] | null> {
    if (events.length === 0) {
      return []
    }

    const supabase = await createClient()

    const { data, error } = await supabase.from("rain_events").insert(events).select()

    if (error) {
      console.error("[rain] Error inserting events:", error)
      return null
    }

    return data
  }
}
