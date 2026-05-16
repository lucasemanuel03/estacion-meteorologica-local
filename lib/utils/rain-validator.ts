import type { RainEventInput, RainEventInsert, RainEventsPayload } from "@/lib/types/rain"

/** 2020-01-01T00:00:00Z — rechaza epoch sin NTP */
const MIN_TIMESTAMP_SEC = 1577836800

/** Tolerancia por desfase de reloj del dispositivo */
const MAX_FUTURE_SKEW_SEC = 300

export interface RejectedRainEvent {
  index: number
  reason: string
}

export class RainValidator {
  static validatePayload(payload: unknown): payload is RainEventsPayload {
    if (typeof payload !== "object" || payload === null) {
      return false
    }

    const data = payload as Record<string, unknown>

    if (data.offline_data !== undefined && typeof data.offline_data !== "boolean") {
      return false
    }

    if (!Array.isArray(data.events) || data.events.length === 0) {
      return false
    }

    return true
  }

  static validateTimestamp(timestamp: unknown): { valid: true; value: number } | { valid: false; reason: string } {
    if (timestamp === undefined || timestamp === null) {
      return { valid: false, reason: "missing timestamp" }
    }

    if (typeof timestamp !== "number" || !Number.isFinite(timestamp)) {
      return { valid: false, reason: "timestamp must be a number" }
    }

    if (!Number.isInteger(timestamp)) {
      return { valid: false, reason: "timestamp must be an integer (Unix seconds)" }
    }

    if (timestamp < MIN_TIMESTAMP_SEC) {
      return { valid: false, reason: "timestamp out of range (clock not synced?)" }
    }

    const maxAllowed = Math.floor(Date.now() / 1000) + MAX_FUTURE_SKEW_SEC
    if (timestamp > maxAllowed) {
      return { valid: false, reason: "timestamp is in the future" }
    }

    return { valid: true, value: timestamp }
  }

  /**
   * Filtra eventos válidos. Los que no incluyen timestamp o fallan validación se descartan.
   */
  static parseEvents(
    events: unknown[],
    isOffline: boolean,
  ): { toInsert: RainEventInsert[]; rejected: RejectedRainEvent[] } {
    const toInsert: RainEventInsert[] = []
    const rejected: RejectedRainEvent[] = []

    for (let index = 0; index < events.length; index++) {
      const item = events[index]

      if (typeof item !== "object" || item === null) {
        rejected.push({ index, reason: "invalid event object" })
        continue
      }

      const { timestamp } = item as RainEventInput
      const result = this.validateTimestamp(timestamp)

      if (!result.valid) {
        rejected.push({ index, reason: result.reason })
        continue
      }

      toInsert.push({
        recorded_at: new Date(result.value * 1000).toISOString(),
        is_offline: isOffline,
      })
    }

    return { toInsert, rejected }
  }
}
