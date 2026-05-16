import type { StationStatusInsert, StationStatusPayload } from "@/lib/types/station-status"

const MAC_ADDRESS_REGEX = /^([0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}$/
const MIN_VALID_TIMESTAMP_SEC = 1577836800 // 2020-01-01T00:00:00Z
const MAX_FUTURE_SKEW_SEC = 300
const RESET_REASON_MAX_LEN = 128

export class StationStatusValidator {
  static validatePayload(payload: unknown): payload is StationStatusPayload {
    if (typeof payload !== "object" || payload === null) {
      return false
    }

    const data = payload as Record<string, unknown>

    if (data.report_type !== "ROUTINE" && data.report_type !== "BOOT") {
      return false
    }

    if (!this.isNonNegativeInteger(data.timestamp) && data.timestamp !== 0) {
      return false
    }

    if (!this.isNonNegativeInteger(data.uptime_sec)) {
      return false
    }

    if (!this.isBoard(data.board)) {
      return false
    }

    if (!this.isSensors(data.sensors)) {
      return false
    }

    return true
  }

  static validateRanges(payload: StationStatusPayload): {
    valid: boolean
    errors: string[]
  } {
    const errors: string[] = []

    if (payload.timestamp !== 0) {
      const maxAllowed = Math.floor(Date.now() / 1000) + MAX_FUTURE_SKEW_SEC
      if (payload.timestamp < MIN_VALID_TIMESTAMP_SEC) {
        errors.push("timestamp out of range (expected Unix seconds since 2020, or 0 if NTP failed)")
      }
      if (payload.timestamp > maxAllowed) {
        errors.push("timestamp is in the future")
      }
    }

    if (payload.board.free_heap_bytes > 1_000_000) {
      errors.push("free_heap_bytes is unreasonably large")
    }

    if (payload.board.wifi_rssi_dbm < -120 || payload.board.wifi_rssi_dbm > 0) {
      errors.push("wifi_rssi_dbm must be between -120 and 0 dBm")
    }

    if (!payload.board.reset_reason.trim()) {
      errors.push("reset_reason must not be empty")
    }

    if (payload.board.reset_reason.length > RESET_REASON_MAX_LEN) {
      errors.push(`reset_reason must be at most ${RESET_REASON_MAX_LEN} characters`)
    }

    if (!MAC_ADDRESS_REGEX.test(payload.board.mac_address)) {
      errors.push('mac_address must match format "XX:XX:XX:XX:XX:XX"')
    }

    if (payload.sensors.rain_gauge.unsent_events_count > payload.sensors.rain_gauge.total_events_since_boot) {
      errors.push("unsent_events_count cannot exceed total_events_since_boot")
    }

    return { valid: errors.length === 0, errors }
  }

  static toInsert(payload: StationStatusPayload): {
    insert: StationStatusInsert
    ntp_synced: boolean
  } {
    const ntpSynced = payload.timestamp > 0
    const recordedAt = ntpSynced
      ? new Date(payload.timestamp * 1000).toISOString()
      : new Date().toISOString()

    return {
      ntp_synced: ntpSynced,
      insert: {
        report_type: payload.report_type,
        device_timestamp: payload.timestamp,
        recorded_at: recordedAt,
        uptime_sec: payload.uptime_sec,
        free_heap_bytes: payload.board.free_heap_bytes,
        wifi_rssi_dbm: payload.board.wifi_rssi_dbm,
        reset_reason: payload.board.reset_reason.trim(),
        mac_address: payload.board.mac_address.toUpperCase(),
        dht_status: payload.sensors.dht.status,
        bmp180_status: payload.sensors.bmp180.status,
        rain_pin_state: payload.sensors.rain_gauge.current_pin_state,
        rain_total_events_since_boot: payload.sensors.rain_gauge.total_events_since_boot,
        rain_unsent_events_count: payload.sensors.rain_gauge.unsent_events_count,
      },
    }
  }

  private static isBoard(board: unknown): boolean {
    if (typeof board !== "object" || board === null) {
      return false
    }

    const data = board as Record<string, unknown>

    if (!this.isNonNegativeInteger(data.free_heap_bytes)) {
      return false
    }

    if (typeof data.wifi_rssi_dbm !== "number" || !Number.isFinite(data.wifi_rssi_dbm)) {
      return false
    }

    if (typeof data.reset_reason !== "string") {
      return false
    }

    if (typeof data.mac_address !== "string") {
      return false
    }

    return true
  }

  private static isSensors(sensors: unknown): boolean {
    if (typeof sensors !== "object" || sensors === null) {
      return false
    }

    const data = sensors as Record<string, unknown>

    if (!this.isSensorStatusBlock(data.dht)) {
      return false
    }

    if (!this.isSensorStatusBlock(data.bmp180)) {
      return false
    }

    if (!this.isRainGauge(data.rain_gauge)) {
      return false
    }

    return true
  }

  private static isSensorStatusBlock(block: unknown): boolean {
    if (typeof block !== "object" || block === null) {
      return false
    }

    const status = (block as Record<string, unknown>).status
    return status === "OK" || status === "ERROR"
  }

  private static isRainGauge(rainGauge: unknown): boolean {
    if (typeof rainGauge !== "object" || rainGauge === null) {
      return false
    }

    const data = rainGauge as Record<string, unknown>

    if (data.current_pin_state !== 0 && data.current_pin_state !== 1) {
      return false
    }

    if (!this.isNonNegativeInteger(data.total_events_since_boot)) {
      return false
    }

    if (!this.isNonNegativeInteger(data.unsent_events_count)) {
      return false
    }

    return true
  }

  private static isNonNegativeInteger(value: unknown): value is number {
    return typeof value === "number" && Number.isInteger(value) && value >= 0
  }
}
