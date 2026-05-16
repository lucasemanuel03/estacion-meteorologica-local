-- Eventos discretos de detección de lluvia (pulsos del sensor)
CREATE TABLE IF NOT EXISTS rain_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recorded_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_offline BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_rain_events_recorded_at ON rain_events (recorded_at DESC);

-- RLS: lecturas públicas para el dashboard; inserts vía service role en el API route
ALTER TABLE rain_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rain_events_select_anon"
  ON rain_events
  FOR SELECT
  TO anon, authenticated
  USING (true);
