import { createAdminClient } from "@/lib/supabase/admin"

export class ConversionRepository {
  /**
   * Devuelve el factor de conversión (mm por evento) para un nombre de evento
   * Si no existe, devuelve 1 por defecto
   */
  static async getFactor(eventName: string): Promise<number> {
    try {
      const supabase = createAdminClient()
      const { data, error } = await supabase
        .from("conversion_factors")
        .select("factor")
        .eq("event_name", eventName)
        .limit(1)
        .maybeSingle()

      if (error) {
        console.error("[conversion] Error fetching factor:", error)
        return 1
      }

      if (!data || data.factor === null || data.factor === undefined) return 1

      return Number(data.factor)
    } catch (err) {
      console.error("[conversion] Unexpected error fetching factor:", err)
      return 1
    }
  }
}
