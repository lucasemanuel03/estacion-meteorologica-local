-- Tabla para almacenar API keys de forma segura.
-- No se guarda la key en texto plano: solo su hash HMAC-SHA256.
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key_hash TEXT UNIQUE NOT NULL,
  key_prefix TEXT,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_api_keys_key_hash ON api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_api_keys_is_active ON api_keys(is_active);

-- Tabla para lecturas detalladas
CREATE TABLE IF NOT EXISTS weather_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  temperature DECIMAL(5,2) NOT NULL,
  humidity DECIMAL(5,2) NOT NULL CHECK (humidity >= 0 AND humidity <= 100),
  rain_mm DECIMAL(5,2) DEFAULT 0 CHECK (rain_mm >= 0), -- Campo para lluvia
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla para extremos diarios
CREATE TABLE IF NOT EXISTS daily_extremes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE UNIQUE NOT NULL DEFAULT CURRENT_DATE,
  -- Temperaturas
  temp_max DECIMAL(5,2),
  temp_min DECIMAL(5,2),
  temp_max_time TIMESTAMPTZ,
  temp_min_time TIMESTAMPTZ,
  -- Humedad
  humidity_max DECIMAL(5,2),
  humidity_min DECIMAL(5,2),
  humidity_max_time TIMESTAMPTZ,
  humidity_min_time TIMESTAMPTZ,
  -- Lluvia Acumulada
  precip_total DECIMAL(6,2) DEFAULT 0,
  last_value DECIMAL(5,2), -- Para consulta rápida de "actual"
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices (Se mantienen igual, son correctos)
CREATE INDEX IF NOT EXISTS idx_weather_readings_recorded_at ON weather_readings(recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_daily_extremes_date ON daily_extremes(date DESC);
