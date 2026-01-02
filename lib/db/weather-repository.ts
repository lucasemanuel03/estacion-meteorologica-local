import { createClient } from "@/lib/supabase/server"
import type { WeatherReading, DailyExtremes, ESP32Payload } from "@/lib/types/weather"

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
    const supabase = await createClient()
    const today = new Date().toISOString().split("T")[0]

    const { data, error } = await supabase.from("daily_extremes").select("*").eq("date", today).limit(1)

    if (error) {
      console.error("[v0] Error fetching today extremes:", error)
      return null
    }

    return data && data.length > 0 ? data[0] : null
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
  static async updateDailyExtremes(reading: WeatherReading): Promise<void> {
    try {
      const supabase = await createClient()
      const date = new Date(reading.recorded_at).toISOString().split("T")[0]

      // Obtener extremos actuales del día
      const { data: currentExtremes, error: fetchError } = await supabase
        .from("daily_extremes")
        .select("*")
        .eq("date", date)
        .maybeSingle()

      if (fetchError && fetchError.code !== "PGRST116") {
        console.error("[v0] Error fetching daily extremes:", fetchError)
        return
      }

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

        if (currentExtremes) {
          // Si existe registro para hoy, actualizar
          const { error: updateError } = await supabase
            .from("daily_extremes")
            .update(updates)
            .eq("date", date)

          if (updateError) {
            console.error("[v0] Error updating daily extremes:", updateError)
          }
        } else {
          // Si no existe registro, crear uno nuevo
          const { error: insertError } = await supabase.from("daily_extremes").insert({
            date,
            ...updates,
          })

          if (insertError) {
            console.error("[v0] Error inserting daily extremes:", insertError)
          }
        }
      }
    } catch (error) {
      console.error("[v0] Error in updateDailyExtremes:", error)
    }
  }

  /**
   * Verifica si una API key es válida
   */
  static async validateApiKey(apiKey: string): Promise<boolean> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("api_keys")
      .select("is_active")
      .eq("key", apiKey)
      .eq("is_active", true)
      .single()

    if (error || !data) {
      return false
    }

    // Actualizar last_used_at
    await supabase.from("api_keys").update({ last_used_at: new Date().toISOString() }).eq("key", apiKey)

    return true
  }
}
