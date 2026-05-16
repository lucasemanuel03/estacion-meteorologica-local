export type StationReportType = "ROUTINE" | "BOOT"

export type SensorHealthStatus = "OK" | "ERROR"

export interface StationStatusPayload {
  report_type: StationReportType
  timestamp: number
  uptime_sec: number
  board: {
    free_heap_bytes: number
    wifi_rssi_dbm: number
    reset_reason: string
    mac_address: string
  }
  sensors: {
    dht: {
      status: SensorHealthStatus
    }
    bmp180: {
      status: SensorHealthStatus
    }
    rain_gauge: {
      current_pin_state: 0 | 1
      total_events_since_boot: number
      unsent_events_count: number
    }
  }
}

export interface StationStatusReport {
  id: string
  report_type: StationReportType
  device_timestamp: number
  ntp_synced: boolean
  recorded_at: string
  uptime_sec: number
  free_heap_bytes: number
  wifi_rssi_dbm: number
  reset_reason: string
  mac_address: string
  dht_status: SensorHealthStatus
  bmp180_status: SensorHealthStatus
  rain_pin_state: 0 | 1
  rain_total_events_since_boot: number
  rain_unsent_events_count: number
  created_at: string
}

export interface FormattedStationStatusReport {
  id: string
  report_type: StationReportType
  device_timestamp: number
  ntp_synced: boolean
  recorded_at: string
  uptime_sec: number
  board: {
    free_heap_bytes: number
    wifi_rssi_dbm: number
    reset_reason: string
    mac_address: string
  }
  sensors: {
    dht: { status: SensorHealthStatus }
    bmp180: { status: SensorHealthStatus }
    rain_gauge: {
      current_pin_state: 0 | 1
      total_events_since_boot: number
      unsent_events_count: number
    }
  }
  created_at: string
}

export interface StationStatusLatestResponse {
  report: FormattedStationStatusReport
  timestamp: string
}

export interface StationStatusRecentResponse {
  reports: FormattedStationStatusReport[]
  limit: number
  count: number
  timestamp: string
}

export interface StationStatusInsert {
  report_type: StationReportType
  device_timestamp: number
  recorded_at: string
  uptime_sec: number
  free_heap_bytes: number
  wifi_rssi_dbm: number
  reset_reason: string
  mac_address: string
  dht_status: SensorHealthStatus
  bmp180_status: SensorHealthStatus
  rain_pin_state: 0 | 1
  rain_total_events_since_boot: number
  rain_unsent_events_count: number
}
