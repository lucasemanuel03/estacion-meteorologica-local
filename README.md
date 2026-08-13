# 🌡️ Estación Meteorológica Local

**Sistema de Monitoreo Meteorológico Doméstico en Tiempo Real**

> Captura, almacena y visualiza datos meteorológicos desde un microcontrolador ESP01 con sensores de temperatura y humedad en una elegante aplicación web fullstack.

---

## 📌 Descripción General

**Estación Meteorológica Local** es una solución completa de monitoreo ambiental que integra hardware IoT con una aplicación web moderna. El sistema recopila automáticamente datos de sensores físicos, los procesa en un backend robusto y los presenta en un dashboard intuitivo y responsivo.

### ✨ Características Principales

- **📊 Datos en Tiempo Real** - Valores actuales de temperatura y humedad actualizados automáticamente
- **📈 Tendencias Diarias** - Visualización de cambios progresivos a lo largo del día
- **🔝 Extremos del Día** - Máximos y mínimos registrados con timestamps exactos
- **📉 Estadísticas Detalladas** - Análisis completo del comportamiento meteorológico diario
- **🚨 Sistema de Alertas** - Notificaciones automáticas ante pérdida de conexión del sensor
- **🔄 Actualización Automática** - Datos frescos sin necesidad de recargar la página
- **📱 Diseño Responsivo** - Experiencia optimizada para dispositivos móviles y escritorio

---

## 🏗️ Arquitectura Técnica

### Stack Tecnológico

| Componente | Tecnología |
|---|---|
| **Frontend** | Next.js 14+, React, TypeScript, Tailwind CSS, ShadcnUI |
| **Backend** | Next.js API Routes, TypeScript |
| **Base de Datos** | PostgreSQL |
| **Actualización de Datos** | SWR (Stale-While-Revalidate) |
| **Hardware** | ESP01 (Microcontrolador) |
| **Versionado** | Git |

### 📐 Estructura del Proyecto

```
estacion-meteorologica-local/
├── app/
│   ├── api/                          # Endpoints de la API
│   │   ├── weather-data/             # Captura y lectura de datos meteorológicos
│   │   └── todays-stats/             # Estadísticas del día
│   └── dashboard/                    # Página principal del sistema
├── components/
│   ├── weather/                      # Componentes del dashboard
│   │   ├── weather-dashboard.tsx
│   │   ├── weather-card.tsx
│   │   └── extremes-display.tsx
│   ├── todays-stats/                 # Componentes de estadísticas
│   │   └── estadisticas-hoy.tsx
│   └── ui/                           # Componentes reutilizables
│       ├── modal-error.tsx
│       ├── advertencia-card.tsx
│       └── alert-dialog.tsx
├── lib/
│   ├── types/                        # Definiciones TypeScript
│   │   └── weather.ts
│   ├── utils/
│   │   ├── functions/
│   │   │   └── getTempColor.ts       # Lógica de colores por temperatura
│   │   └── cn.ts
│   └── db/                           # Conexión a base de datos
├── CASOS_DE_USO.md                   # Especificación de casos de uso
└── package.json
```

---

## 🔄 Flujo de Datos

```
┌─────────────────────────────────┐
│       ESP01 Sensor              │
│  Temperatura + Humedad          │
└────────────┬────────────────────┘
             │ HTTP POST (cada 15 min)
             ▼
┌─────────────────────────────────┐
│   API: /api/weather-data        │
│  • Validación de datos          │
│  • Almacenamiento en BD         │
│  • Respuesta confirmación       │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│    Base de Datos PostgreSQL     │
│   Tabla: weather_readings       │
└────────────┬────────────────────┘
             │
    ┌────────┼────────┐
    │        │        │
    ▼        ▼        ▼
 Última   Extremos  Tendencias
Medición   Diarios    del Día
    │        │        │
    └────────┼────────┘
             │
    ┌────────┴────────┐
    │                 │
    ▼                 ▼
 SWR (60s)      Endpoints API
    │                 │
    └────────┬────────┘
             │
             ▼
    ┌─────────────────┐
    │  Dashboard      │
    │  • Valores      │
    │  • Extremos     │
    │  • Tendencias   │
    │  • Estadísticas │
    │  • Alertas      │
    └─────────────────┘
```

---

## 🗄️ Modelo de Datos

### Tabla: weather_readings

```sql
CREATE TABLE weather_readings (
  id SERIAL PRIMARY KEY,
  temperature DECIMAL(5,2) NOT NULL,      -- Rango: -50 a 60°C
  humidity DECIMAL(5,2) NOT NULL,         -- Rango: 0 a 100%
  recorded_at TIMESTAMP NOT NULL,         -- Cuándo se midió
  created_at TIMESTAMP DEFAULT NOW(),     -- Cuándo se guardó
  INDEX(recorded_at DESC)                 -- Optimización de consultas
);
```

---

## 🔌 API Endpoints

### POST /api/weather-data
Recibe y almacena datos del ESP01

**Request:**
```json
{
  "temperature": 22.5,
  "humidity": 65.3
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Datos guardados correctamente",
  "reading": {
    "id": 123,
    "temperature": 22.5,
    "humidity": 65.3,
    "recorded_at": "2026-01-06T10:30:00Z"
  }
}
```

---

### GET /api/weather-data
Obtiene última lectura y extremos del día

**Response (200):**
```json
{
  "latestReading": {
    "temperature": 22.5,
    "humidity": 65.3,
    "recorded_at": "2026-01-06T10:30:00Z"
  },
  "todayExtremes": {
    "temp_max": 25.0,
    "temp_max_time": "2026-01-06T14:30:00Z",
    "temp_min": 18.5,
    "temp_min_time": "2026-01-06T06:15:00Z",
    "humidity_max": 78.0,
    "humidity_min": 45.5
  }
}
```

---

### GET /api/todays-stats/trend
Obtiene tendencias de temperatura y humedad

**Response (200):**
```json
{
  "success": true,
  "tempTrend": {
    "differential": 3.5,
    "message": "↑ Aumentando 3.5°C desde el inicio del día"
  },
  "humTrend": {
    "differential": -5.2,
    "message": "↓ Disminuyendo 5.2% desde el inicio del día"
  }
}
```

---

## 📋 Requisitos No Funcionales

### ⚡ Rendimiento
- Actualización de interfaz en < 500ms
- API responde en < 1000ms
- Carga inicial del dashboard en < 2 segundos

### 🛡️ Disponibilidad
- Sistema disponible 24/7
- Tolerancia de fallos del sensor con alertas
- Recovery automático de fallos temporales

### 🎯 Precisión
- Datos meteorológicos con precisión ±0.5°C
- Almacenamiento con timestamp exacto
- Cálculos estadísticos precisos (2 decimales)

### 📈 Escalabilidad
- Almacenamiento de datos históricos de meses
- Base de datos optimizada para consultas frecuentes
- Soporte para múltiples sensores en versiones futuras

### 📱 Usabilidad
- Interfaz adaptable a dispositivos móviles
- Visualización clara de alertas y advertencias
- Mensajes en español

### 🔒 Seguridad
- Validación de entrada en todas las solicitudes
- Verificación de rangos esperados
- Protección contra datos malformados

### 🔧 Mantenibilidad
- Código modular y reutilizable
- Componentes bien documentados
- Arquitectura escalable

---

## 🚀 Instalación y Setup

### Requisitos Previos
- Node.js 18+
- PostgreSQL 14+
- npm o yarn

### Paso 1: Clonar el Repositorio
```bash
git clone https://github.com/lucasemanuel03/estacion-meteorologica-local.git
cd estacion-meteorologica-local
```

### Paso 2: Variables de Entorno
Crear archivo `.env.local`:

```env
# Base de Datos
DATABASE_URL=postgresql://user:password@localhost:5432/weather_station

# Configuración del Sistema
API_PORT=3000
SENSOR_TIMEOUT_WARNING=20
SENSOR_TIMEOUT_ERROR=30
```

### Paso 3: Instalación de Dependencias
```bash
npm install
```

### Paso 4: Iniciar el Servidor de Desarrollo
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

### Paso 5: Configurar ESP01

Configurar el microcontrolador para enviar datos POST al endpoint:

```
URL: http://<tu-ip-local>:3000/api/weather-data
Método: POST
Payload: {"temperature": XX.X, "humidity": XX.X}
Intervalo: 15 minutos
```

---

## 📚 Documentación Adicional

- **[Casos de Uso](./CASOS_DE_USO.md)** - Especificación detallada de todos los casos de uso del sistema

---

## 🎨 Componentes Reutilizables

### modal-error.tsx
- **Propósito:** Mostrar alertas críticas del sistema
- **Props:** `open`, `onOpenChange`, `title`, `description`
- **Ubicación:** `/components/ui/modal-error.tsx`

### advertencia-card.tsx
- **Propósito:** Notificaciones no-modales
- **Props:** `nivel` (warning|error), `titulo`, `descripcion`
- **Ubicación:** `/components/ui/advertencia-card.tsx`

### weather-card.tsx
- **Propósito:** Mostrar valores de sensores individuales
- **Props:** Título, valor, unidad, icono, etc.
- **Ubicación:** `/components/weather/weather-card.tsx`

---

## 🚦 Estados de Conexión

El sistema monitorea la conexión del sensor con tres estados distintos:

```
NORMAL (< 20 min)
└─ Sin advertencias
└─ Valores mostrados normalmente

       ↓ (> 20 min)

WARNING (20-30 min)
└─ Card amarilla visible
└─ Mensaje: "Advertencia: Valores no actualizados"
└─ Valores siguen visibles

       ↓ (> 30 min)

ERROR (> 30 min)
└─ Card roja visible
└─ Modal informativo
└─ Mensaje: "Error: Conexión perdida con el sensor"
```

---

## 🗺️ Roadmap Futuro

- [ ] Histórico de datos con gráficos interactivos (Chart.js/Recharts)
- [ ] Exportación de datos a CSV
- [ ] Notificaciones por email en caso de falla
- [ ] Soporte para múltiples sensores
- [ ] Análisis predictivo de tendencias con ML
- [ ] Tema oscuro automático
- [ ] Sistema de autenticación
- [ ] Base de datos distribuida para redundancia

---

## 📧 Contacto y Soporte

Para reportar problemas, sugerencias o contribuciones, por favor abre un issue o un pull request en el repositorio.

---

**Última actualización:** 13 de agosto de 2026  
**Versión:** 2.0  
**Licencia:** MIT

