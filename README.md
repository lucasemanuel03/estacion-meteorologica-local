# Estación Meteorológica Local

Sistema de monitoreo meteorológico en tiempo real con ESP-32 y Next.js.

## Características

- **Backend modular**: Validación de API keys, repositorio de base de datos separado
- **Frontend en tiempo real**: Actualización automática cada 30 segundos con SWR
- **Base de datos PostgreSQL**: Lecturas históricas y extremos diarios
- **Arquitectura escalable**: Preparado para añadir más sensores (precipitación, presión, etc.)

## Estructura del Proyecto

```
├── app/
│   ├── api/
│   │   ├── weather/          # Endpoint para ESP-32
│   │   └── weather-data/     # Endpoint público para dashboard
│   └── page.tsx              # Dashboard principal
├── components/
│   └── weather/
│       ├── weather-card.tsx       # Tarjeta de medición individual
│       ├── extremes-display.tsx   # Display de extremos diarios
│       └── weather-dashboard.tsx  # Dashboard principal
├── lib/
│   ├── db/
│   │   └── weather-repository.ts  # Lógica de base de datos
│   ├── utils/
│   │   └── weather-validator.ts   # Validaciones
│   ├── types/
│   │   └── weather.ts             # Tipos TypeScript
│   └── supabase/                  # Clientes Supabase
└── scripts/
    └── 001_create_weather_tables.sql  # Schema inicial
```

## Configuración

### 1. Ejecutar script de base de datos

El script SQL se ejecutará automáticamente desde v0, o puedes hacerlo manualmente desde el proyecto.

### 2. Configurar API Key

Por defecto, la API key es `esp32-station-key-change-me`. Para cambiarla:

```sql
-- Insertar una nueva API key
INSERT INTO api_keys (key, name) 
VALUES ('tu-api-key-segura', 'Mi ESP32');

-- Desactivar la key de prueba
UPDATE api_keys 
SET is_active = false 
WHERE key = 'esp32-station-key-change-me';
```

### 3. Configurar ESP-32

Envía peticiones POST a `/api/weather` con:

**Headers:**
```
Authorization: Bearer esp32-station-key-change-me
Content-Type: application/json
```

**Body:**
```json
{
  "temperature": 23.5,
  "humidity": 65.2,
  "timestamp": "2025-01-01T12:00:00Z"
}
```

**Ejemplo con Arduino (ESP-32):**

```cpp
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <DHT.h>

#define DHTPIN 4
#define DHTTYPE DHT22
DHT dht(DHTPIN, DHTTYPE);

const char* ssid = "TU_WIFI";
const char* password = "TU_PASSWORD";
const char* serverUrl = "https://tu-dominio.vercel.app/api/weather";
const char* apiKey = "esp32-station-key-change-me";

void setup() {
  Serial.begin(115200);
  dht.begin();
  
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Conectando a WiFi...");
  }
  Serial.println("Conectado a WiFi");
}

void loop() {
  float humidity = dht.readHumidity();
  float temperature = dht.readTemperature();
  
  if (isnan(humidity) || isnan(temperature)) {
    Serial.println("Error leyendo sensor DHT");
    delay(2000);
    return;
  }
  
  HTTPClient http;
  http.begin(serverUrl);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("Authorization", String("Bearer ") + apiKey);
  
  StaticJsonDocument<200> doc;
  doc["temperature"] = temperature;
  doc["humidity"] = humidity;
  
  String jsonData;
  serializeJson(doc, jsonData);
  
  int httpResponseCode = http.POST(jsonData);
  
  if (httpResponseCode > 0) {
    Serial.print("Datos enviados. Código: ");
    Serial.println(httpResponseCode);
  } else {
    Serial.print("Error: ");
    Serial.println(httpResponseCode);
  }
  
  http.end();
  
  // Esperar 30 minutos (1800000 ms)
  delay(1800000);
}
```

## API Endpoints

### POST /api/weather
Recibe datos de la ESP-32 (protegido con API key)

**Headers requeridos:**
- `Authorization: Bearer <api-key>`

**Body:**
```json
{
  "temperature": 23.5,
  "humidity": 65.2,
  "timestamp": "2025-01-01T12:00:00Z"  // Opcional
}
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "reading": {
    "id": "uuid",
    "temperature": 23.5,
    "humidity": 65.2,
    "recorded_at": "2025-01-01T12:00:00Z"
  }
}
```

### GET /api/weather-data
Obtiene datos para el dashboard (público, sin autenticación)

**Respuesta:**
```json
{
  "latestReading": {
    "id": "uuid",
    "temperature": 23.5,
    "humidity": 65.2,
    "recorded_at": "2025-01-01T12:00:00Z"
  },
  "todayExtremes": {
    "temp_max": 25.3,
    "temp_min": 18.7,
    "temp_max_time": "2025-01-01T14:30:00Z",
    "temp_min_time": "2025-01-01T05:15:00Z",
    "humidity_max": 78.5,
    "humidity_min": 45.2
  },
  "timestamp": "2025-01-01T16:00:00Z"
}
```

## Escalabilidad

El proyecto está diseñado para escalar fácilmente:

### Añadir nuevos sensores (ejemplo: precipitación)

**1. Actualizar tipos:**
```typescript
// lib/types/weather.ts
export interface WeatherReading {
  // ... campos existentes
  rainfall?: number  // mm de lluvia
  pressure?: number  // presión atmosférica en hPa
}
```

**2. Actualizar schema:**
```sql
-- scripts/002_add_rainfall.sql
ALTER TABLE weather_readings 
ADD COLUMN rainfall DECIMAL(5,2),
ADD COLUMN pressure DECIMAL(6,2);

ALTER TABLE daily_extremes
ADD COLUMN rainfall_total DECIMAL(6,2),
ADD COLUMN pressure_max DECIMAL(6,2),
ADD COLUMN pressure_min DECIMAL(6,2);
```

**3. Actualizar validador:**
```typescript
// lib/utils/weather-validator.ts
static validateRanges(payload: ESP32Payload) {
  // ... validaciones existentes
  if (payload.rainfall && payload.rainfall < 0) {
    errors.push('Rainfall cannot be negative');
  }
}
```

**4. Añadir componente UI:**
```tsx
// components/weather/rainfall-card.tsx
<WeatherCard
  title="Precipitación"
  value={data?.latestReading?.rainfall}
  unit="mm"
  icon={<Cloud />}
/>
```

## Validaciones

- **Temperatura**: -50°C a 60°C
- **Humedad**: 0% a 100%
- **API Key**: Verificación en base de datos
- **Payload**: Validación de estructura y tipos

## Tecnologías

- **Frontend**: Next.js 16, React 19, TailwindCSS v4
- **Backend**: Next.js API Routes
- **Base de datos**: PostgreSQL (Supabase)
- **Actualización en tiempo real**: SWR con revalidación cada 30s
- **Hardware**: ESP-32 con sensor DHT22/DHT11

## Seguridad

- API keys almacenadas en base de datos
- Validación de rangos de sensores
- Sin RLS (datos públicos de solo lectura)
- Escritura protegida por API key

## Deploy

El proyecto está listo para desplegarse en Vercel con el botón "Publish" en v0.
