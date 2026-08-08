import type {
  RainEventInput,
  RainEventInsert,
  RainEventsPayload,
  RainEventsPayloadLegacy,
  RainWindowPayload,
} from "@/lib/types/rain"

/** 2020-01-01T00:00:00Z — rechaza epoch sin NTP */
const MIN_TIMESTAMP_SEC = 1577836800

/** Tolerancia por desfase de reloj del dispositivo */
const MAX_FUTURE_SKEW_SEC = 300

/** Tope de impulsos por ventana para evitar payloads abusivos */
const MAX_WINDOW_COUNT = 10_000

export interface RejectedRainEvent {
  index: number
  reason: string
}

export class RainValidator {
  static isLegacyPayload(payload: RainEventsPayload): payload is RainEventsPayloadLegacy {
    return Array.isArray((payload as RainEventsPayloadLegacy).events)
  }

  static isWindowPayload(payload: RainEventsPayload): payload is RainWindowPayload {
    return typeof (payload as RainWindowPayload).count === "number"
  }

  static validatePayload(payload: unknown): payload is RainEventsPayload {
    if (typeof payload !== "object" || payload === null) {
      return false
    }

    const data = payload as Record<string, unknown>

    if (data.offline_data !== undefined && typeof data.offline_data !== "boolean") {
      return false
    }

    const hasEvents = Array.isArray(data.events) && data.events.length > 0
    const hasWindow =
      typeof data.count === "number" &&
      Number.isFinite(data.count) &&
      data.timestamp !== undefined &&
      data.timestamp !== null

    if (hasEvents && hasWindow) {
      return false
    }

    if (hasEvents) {
      return true
    }

    if (!hasWindow) {
      return false
    }

    if (!Number.isInteger(data.count) || (data.count as number) < 1) {
      return false
    }

    if ((data.count as number) > MAX_WINDOW_COUNT) {
      return false
    }

    const closeTimestamp = data.window_end ?? data.timestamp
    return this.validateTimestamp(closeTimestamp).valid
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

  static validateCount(count: unknown): { valid: true; value: number } | { valid: false; reason: string } {
    if (count === undefined || count === null) {
      return { valid: false, reason: "missing count" }
    }

    if (typeof count !== "number" || !Number.isFinite(count)) {
      return { valid: false, reason: "count must be a number" }
    }

    if (!Number.isInteger(count)) {
      return { valid: false, reason: "count must be an integer" }
    }

    if (count < 1) {
      return { valid: false, reason: "count must be at least 1" }
    }

    if (count > MAX_WINDOW_COUNT) {
      return { valid: false, reason: `count exceeds maximum of ${MAX_WINDOW_COUNT}` }
    }

    return { valid: true, value: count }
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

  /**
   * Expande una ventana agregada en N filas (una por impulso) con el mismo recorded_at.
   * windowCloseTimestamp: cierre de ventana (window_end ?? timestamp).
   */
  static parseWindow(
    count: unknown,
    windowCloseTimestamp: unknown,
    isOffline: boolean,
  ): { toInsert: RainEventInsert[]; rejected: RejectedRainEvent[] } {
    const countResult = this.validateCount(count)
    if (!countResult.valid) {
      return { toInsert: [], rejected: [{ index: 0, reason: countResult.reason }] }
    }

    const timestampResult = this.validateTimestamp(windowCloseTimestamp)
    if (!timestampResult.valid) {
      return { toInsert: [], rejected: [{ index: 0, reason: timestampResult.reason }] }
    }

    const recorded_at = new Date(timestampResult.value * 1000).toISOString()
    const toInsert: RainEventInsert[] = Array.from({ length: countResult.value }, () => ({
      recorded_at,
      is_offline: isOffline,
    }))

    return { toInsert, rejected: [] }
  }
}
