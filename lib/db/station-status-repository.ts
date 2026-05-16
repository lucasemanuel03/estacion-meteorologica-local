import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import type { StationStatusInsert, StationStatusReport } from "@/lib/types/station-status"

export class StationStatusRepository {
  static async insertReport(insert: StationStatusInsert): Promise<StationStatusReport | null> {
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from("station_status_reports")
      .insert(insert)
      .select()
      .single()

    if (error) {
      console.error("[station-status] Error inserting report:", error)
      return null
    }

    return data
  }

  static async getLatest(): Promise<StationStatusReport | null> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("station_status_reports")
      .select("*")
      .order("recorded_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) {
      console.error("[station-status] Error fetching latest report:", error)
      return null
    }

    return data
  }

  static async getRecent(limit: number): Promise<StationStatusReport[] | null> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("station_status_reports")
      .select("*")
      .order("recorded_at", { ascending: false })
      .limit(limit)

    if (error) {
      console.error("[station-status] Error fetching recent reports:", error)
      return null
    }

    return data ?? []
  }

  static async getLatestByMac(macAddress: string): Promise<StationStatusReport | null> {
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from("station_status_reports")
      .select("*")
      .eq("mac_address", macAddress.toUpperCase())
      .order("recorded_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) {
      console.error("[station-status] Error fetching latest report:", error)
      return null
    }

    return data
  }

  /**
   * Elimina reportes con recorded_at anterior al umbral indicado.
   */
  static async deleteOlderThan(cutoffIso: string): Promise<{ deletedCount: number } | null> {
    const supabase = createAdminClient()

    const { error, count } = await supabase
      .from("station_status_reports")
      .delete({ count: "exact" })
      .lt("recorded_at", cutoffIso)

    if (error) {
      console.error("[station-status] Error deleting old reports:", error)
      return null
    }

    return { deletedCount: count ?? 0 }
  }
}
