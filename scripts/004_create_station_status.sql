-- Reportes periódicos de estado de la NodeMCU (heartbeat / boot)
CREATE TABLE IF NOT EXISTS station_status_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  report_type TEXT NOT NULL CHECK (report_type IN ('ROUTINE', 'BOOT')),

  -- Epoch Unix del dispositivo (0 si NTP falló)
  device_timestamp BIGINT NOT NULL,
  ntp_synced BOOLEAN NOT NULL GENERATED ALWAYS AS (device_timestamp > 0) STORED,

  -- Momento del reporte usado para consultas (device si NTP ok, si no hora del servidor al insertar)
  recorded_at TIMESTAMPTZ NOT NULL,

  uptime_sec INTEGER NOT NULL CHECK (uptime_sec >= 0),

  free_heap_bytes INTEGER NOT NULL CHECK (free_heap_bytes >= 0),
  wifi_rssi_dbm INTEGER NOT NULL CHECK (wifi_rssi_dbm BETWEEN -120 AND 0),
  reset_reason TEXT NOT NULL,
  mac_address TEXT NOT NULL,

  dht_status TEXT NOT NULL CHECK (dht_status IN ('OK', 'ERROR')),
  bmp180_status TEXT NOT NULL CHECK (bmp180_status IN ('OK', 'ERROR')),

  rain_pin_state SMALLINT NOT NULL CHECK (rain_pin_state IN (0, 1)),
  rain_total_events_since_boot BIGINT NOT NULL CHECK (rain_total_events_since_boot >= 0),
  rain_unsent_events_count INTEGER NOT NULL CHECK (rain_unsent_events_count >= 0),

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_station_status_recorded_at
  ON station_status_reports (recorded_at DESC);

CREATE INDEX IF NOT EXISTS idx_station_status_mac_recorded_at
  ON station_status_reports (mac_address, recorded_at DESC);

-- RLS: lecturas públicas para el dashboard; inserts vía service role en el API route
ALTER TABLE station_status_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "station_status_reports_select_anon"
  ON station_status_reports
  FOR SELECT
  TO anon, authenticated
  USING (true);
