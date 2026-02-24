import type { ESP32Payload } from "@/lib/types/weather"

/**
 * Utilidades de validación para datos meteorológicos
 * Validaciones centralizadas y reutilizables
 */

export class WeatherValidator {
  // Rangos razonables para validación
  private static readonly TEMP_MIN = -50
  private static readonly TEMP_MAX = 60
  private static readonly HUMIDITY_MIN = 0
  private static readonly HUMIDITY_MAX = 100
  private static readonly PRESSURE_MIN = 300 // hPa
  private static readonly PRESSURE_MAX = 1100 // hPa

  /**
   * Valida que el payload de la ESP32 tenga el formato correcto
   */
  static validatePayload(payload: unknown): payload is ESP32Payload {
    if (typeof payload !== "object" || payload === null) {
      return false
    }

    const data = payload as Record<string, unknown>

    // Verificar temperatura
    if (typeof data.temperature !== "number" || isNaN(data.temperature)) {
      return false
    }

    // Verificar humedad
    if (typeof data.humidity !== "number" || isNaN(data.humidity)) {
      return false
    }

    // Presión atmosférica es opcional pero si viene debe ser número
    if (data.pressure_atm !== undefined && (typeof data.pressure_atm !== "number" || isNaN(data.pressure_atm))) {
      return false
    }

    // Timestamp es opcional
    if (data.timestamp !== undefined && typeof data.timestamp !== "string") {
      return false
    }

    return true
  }

  /**
   * Valida que los valores estén dentro de rangos razonables
   */
  static validateRanges(payload: ESP32Payload): {
    valid: boolean
    errors: string[]
  } {
    const errors: string[] = []

    if (payload.temperature < this.TEMP_MIN || payload.temperature > this.TEMP_MAX) {
      errors.push(
        `Temperature ${payload.temperature}°C is outside valid range (${this.TEMP_MIN}°C to ${this.TEMP_MAX}°C)`,
      )
    }

    if (payload.humidity < this.HUMIDITY_MIN || payload.humidity > this.HUMIDITY_MAX) {
      errors.push(
        `Humidity ${payload.humidity}% is outside valid range (${this.HUMIDITY_MIN}% to ${this.HUMIDITY_MAX}%)`,
      )
    }

    if (payload.pressure_atm !== undefined && (payload.pressure_atm < this.PRESSURE_MIN || payload.pressure_atm > this.PRESSURE_MAX)) {
      errors.push(
        `Pressure ${payload.pressure_atm} hPa is outside valid range (${this.PRESSURE_MIN} hPa to ${this.PRESSURE_MAX} hPa)`,
      )
    }

    return {
      valid: errors.length === 0,
      errors,
    }
  }

  /**
   * Valida la API key del header
   */
  static extractApiKey(authHeader: string | null): string | null {
    if (!authHeader) {
      return null
    }

    // Soportar formato "Bearer <key>" o solo "<key>"
    const parts = authHeader.split(" ")
    return parts.length === 2 ? parts[1] : authHeader
  }
}
