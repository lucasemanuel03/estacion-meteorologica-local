# Especificación del Sistema: Local Weather Station

## 1. Nombre del Sistema
**Local Weather Station** - Sistema de Monitoreo Meteorológico Doméstico en Tiempo Real

---

## 2. Objetivo del Sistema

Proporcionar una solución integral de monitoreo meteorológico local que permita a los usuarios capturar, almacenar y visualizar datos de temperatura y humedad en tiempo real desde un dispositivo ESP01, con capacidad de análisis histórico, detección de tendencias y alertas automáticas de desconexión.

---

## 3. Descripción General

**Local Weather Station** es una aplicación web fullstack que integra un microcontrolador ESP01 como sensor remoto para recopilar datos meteorológicos (temperatura y humedad) en tiempo real. El sistema procesa estos datos, los almacena en una base de datos, y presenta un dashboard interactivo que muestra:

- Valores actuales de temperatura y humedad
- Extremos diarios (máximas y mínimas)
- Tendencias de cambio en las últimas horas
- Estadísticas diarias detalladas
- Alertas automáticas cuando el sensor pierde conexión

El sistema está diseñado para funcionar de manera autónoma con actualización de datos cada 15 minutos desde el sensor, con un mecanismo robusto de detección de fallos y notificación al usuario.

---

## 4. Casos de Uso

### **CU-001: Captura de Datos Meteorológicos**
**Descripción:** El sistema recibe automáticamente datos de temperatura y humedad del ESP01 cada 15 minutos y los almacena en la base de datos.

**Actores:**
- ESP01 (Sistema Externo)
- Backend API

**Precondiciones:**
- El ESP01 está conectado a la red
- La API está disponible y funcionando

**Flujo Principal:**
1. ESP01 realiza una solicitud HTTP POST a `/api/weather-data` con los datos de temperatura y humedad
2. Backend valida los datos recibidos
3. Backend almacena los datos en la base de datos con timestamp
4. Backend retorna confirmación al ESP01

**Postcondiciones:**
- Los datos quedan registrados en la base de datos
- El timestamp de última medición se actualiza

---

### **CU-002: Visualizar Valores Actuales**
**Descripción:** El usuario visualiza en el dashboard los valores actuales de temperatura y humedad del sensor.

**Actores:**
- Usuario Final
- Sistema Web

**Precondiciones:**
- Usuario ha accedido a la aplicación
- Existen datos meteorológicos en la base de datos

**Flujo Principal:**
1. Usuario abre el dashboard
2. Sistema obtiene la última medición de temperatura y humedad
3. Sistema calcula el color de temperatura según rango
4. Sistema muestra las tarjetas con valores, unidades e iconos
5. Sistema muestra el timestamp de la última medición en formato localizado

**Postcondiciones:**
- Usuario visualiza los valores actuales con claridad
- Información se actualiza automáticamente cada 60 segundos

---

### **CU-003: Monitorear Tendencias Meteorológicas**
**Descripción:** El sistema calcula y muestra tendencias de temperatura y humedad comparando mediciones recientes con mediciones anteriores del mismo día.

**Actores:**
- Sistema Backend
- Usuario Final

**Precondiciones:**
- Existen al menos 2 mediciones en la base de datos del día actual
- El endpoint de tendencias funciona correctamente

**Flujo Principal:**
1. Sistema calcula diferencial de temperatura desde inicio del día
2. Sistema calcula diferencial de humedad desde inicio del día
3. Sistema genera mensaje de tendencia (ej: "↑ Aumentando 2.5°C")
4. Sistema retorna datos de tendencia al dashboard
5. Dashboard muestra tendencias debajo de cada valor

**Postcondiciones:**
- Usuario visualiza si los valores están aumentando o disminuyendo
- Se actualiza automáticamente al recargar datos

---

### **CU-004: Consultar Extremos Diarios**
**Descripción:** El usuario puede consultar los valores máximos y mínimos de temperatura registrados durante el día actual.

**Actores:**
- Usuario Final
- Sistema Backend

**Precondiciones:**
- Existen mediciones del día actual
- El endpoint de extremos está disponible

**Flujo Principal:**
1. Usuario visualiza la sección "Extremos Diarios" en el dashboard
2. Sistema obtiene temperatura máxima y mínima del día
3. Sistema obtiene humedad máxima y mínima del día
4. Sistema muestra los extremos en formato de tarjetas
5. Sistema incluye los timestamps de cuándo ocurrieron

**Postcondiciones:**
- Usuario conoce los rangos de variación diaria
- Datos se actualizan en tiempo real con nuevas mediciones

---

### **CU-005: Ver Estadísticas Diarias Detalladas**
**Descripción:** El usuario accede a un análisis completo de estadísticas del día actual incluyendo promedios, rangos y gráficos.

**Actores:**
- Usuario Final
- Sistema Backend

**Precondiciones:**
- Existen múltiples mediciones del día
- El componente de estadísticas está renderizado

**Flujo Principal:**
1. Usuario visualiza la sección "Estadísticas de Hoy"
2. Sistema calcula temperatura promedio del día
3. Sistema calcula humedad promedio del día
4. Sistema calcula diferencial total de temperatura
5. Sistema calcula diferencial total de humedad
6. Sistema presenta información en formato visual (tarjetas/gráficos)

**Postcondiciones:**
- Usuario comprende el comportamiento meteorológico del día
- Datos se actualizan conforme llegan nuevas mediciones

---

### **CU-006: Detectar Desconexión del Sensor**
**Descripción:** El sistema monitorea el tiempo transcurrido desde la última medición y detecta automáticamente cuando el ESP01 pierde conexión.

**Actores:**
- Sistema de Monitoreo
- Usuario Final

**Precondiciones:**
- El sistema está funcionando
- Existen mediciones previas en la base de datos

**Flujo Principal:**
1. Sistema verifica cada minuto el tiempo desde la última medición
2. Si han pasado más de 20 minutos sin nuevas mediciones:
   - Sistema muestra advertencia amarilla (warning)
   - Mensaje: "Advertencia: Valores no actualizados"
3. Si han pasado más de 30 minutos sin nuevas mediciones:
   - Sistema cambia advertencia a roja (error)
   - Sistema muestra modal de error crítico
   - Mensaje: "Error: Conexión perdida con el sensor"

**Postcondiciones:**
- Usuario es notificado de la desconexión
- Modal se muestra solo una vez al cambiar a estado error

---

### **CU-007: Alertar sobre Valores Desactualizados**
**Descripción:** El sistema notifica al usuario cuando los valores mostrados pueden no ser actuales debido a problemas de comunicación.

**Actores:**
- Sistema de Alertas
- Usuario Final

**Precondiciones:**
- Se ha detectado falta de nuevas mediciones (CU-006)

**Flujo Principal:**
1. Sistema muestra card de advertencia en la parte superior del dashboard
2. Card amarilla indica estado "warning" (20-30 min sin datos)
3. Card roja indica estado "error" (>30 min sin datos)
4. Card contiene descripción clara del problema
5. Card se actualiza automáticamente según el estado

**Postcondiciones:**
- Usuario es consciente de la falta de actualización de datos
- Usuario puede tomar acciones (reiniciar sensor, verificar conexión)

---

### **CU-008: Mostrar Modal de Error Crítico**
**Descripción:** Cuando la conexión se pierde completamente, el sistema muestra un modal informativo al usuario con instrucciones.

**Actores:**
- Sistema de Alertas
- Usuario Final

**Precondiciones:**
- Sistema detectó desconexión crítica (>30 minutos)
- Modal no ha sido mostrado antes en esta sesión

**Flujo Principal:**
1. Sistema detecta pérdida de conexión crítica
2. Sistema abre modal de diálogo
3. Modal muestra:
   - Título: "Se perdió conexión con el sensor"
   - Descripción con instrucciones de verificación
   - Botón "Entendido" para cerrar
4. Usuario cierra el modal
5. Card de error sigue visible en el dashboard

**Postcondiciones:**
- Usuario comprende el problema
- Usuario tiene información para resolver el problema
- Modal no reaparece hasta nueva desconexión

---

### **CU-009: Actualización Automática de Datos**
**Descripción:** El sistema actualiza automáticamente todos los datos mostrados sin intervención del usuario.

**Actores:**
- Sistema de Actualización (SWR)
- Usuario Final

**Precondiciones:**
- Usuario está en el dashboard
- API está disponible

**Flujo Principal:**
1. Sistema realiza solicitud a API cada 60 segundos
2. Sistema recibe nuevos datos meteorológicos
3. Sistema actualiza valores en tiempo real
4. Sistema recalcula tendencias
5. Sistema actualiza extremos si hay nuevos
6. Interfaz se renderiza con nuevos valores

**Postcondiciones:**
- Usuario visualiza datos frescos sin recargar la página
- Indicador "Actualizando..." aparece brevemente

---

### **CU-010: Validar Integridad de Datos**
**Descripción:** El sistema valida que los datos recibidos del sensor sean correctos y dentro de rangos esperados.

**Actores:**
- Backend API
- Sistema de Validación

**Precondiciones:**
- Se reciben datos del ESP01

**Flujo Principal:**
1. Backend recibe solicitud HTTP del ESP01
2. Sistema valida que temperatura esté en rango válido (-50 a 60°C)
3. Sistema valida que humedad esté en rango válido (0 a 100%)
4. Sistema verifica que ambos valores estén presentes
5. Si validación es exitosa: almacena datos
6. Si validación falla: rechaza datos y retorna error

**Postcondiciones:**
- Solo datos válidos se almacenan en la base de datos
- Se mantiene integridad de datos históricos

---

## 5. Tabla Resumen de Casos de Uso

| ID | Nombre | Tipo | Complejidad | Prioridad |
|---|---|---|---|---|
| CU-001 | Captura de Datos Meteorológicos | Sistema | Alta | Crítica |
| CU-002 | Visualizar Valores Actuales | Usuario | Media | Crítica |
| CU-003 | Monitorear Tendencias | Sistema | Media | Alta |
| CU-004 | Consultar Extremos Diarios | Usuario | Media | Alta |
| CU-005 | Ver Estadísticas Diarias | Usuario | Media | Media |
| CU-006 | Detectar Desconexión | Sistema | Alta | Crítica |
| CU-007 | Alertar Valores Desactualizados | Sistema | Media | Alta |
| CU-008 | Mostrar Modal de Error | Sistema | Baja | Alta |
| CU-009 | Actualización Automática | Sistema | Media | Crítica |
| CU-010 | Validar Integridad de Datos | Sistema | Media | Alta |

---

## 6. Requisitos No Funcionales

### Rendimiento
- Actualización de interfaz en < 500ms
- API responde en < 1000ms
- Carga inicial del dashboard en < 2 segundos

### Disponibilidad
- Sistema disponible 24/7
- Tolerancia de fallos del sensor con alertas
- Recovery automático de fallos temporales

### Precisión
- Datos meteorológicos con precisión ±0.5°C
- Almacenamiento de datos con timestamp exacto
- Cálculos estadísticos precisos con 2 decimales

### Escalabilidad
- Capacidad de almacenar datos históricos de meses
- Base de datos optimizada para consultas frecuentes
- Soporte para múltiples sensores en futuras versiones

### Usabilidad
- Interfaz adaptable a dispositivos móviles
- Visualización clara de alertas y advertencias
- Mensajes claros en español

### Seguridad
- Validación de entrada en todas las solicitudes
- Rango de datos esperados verificados
- Protección contra datos malformados

### Mantenibilidad
- Código modular y reutilizable
- Componentes bien documentados
- Arquitectura escalable para nuevas funcionalidades

---

## 7. Arquitectura Técnica

### Stack Tecnológico
- **Frontend:** Next.js 14+ (React), TypeScript, Tailwind CSS, ShadcnUI
- **Backend:** Next.js API Routes
- **Base de Datos:** PostgreSQL
- **Estado de Datos:** SWR (para actualización automática)
- **Hardware:** ESP01 (Microcontrolador)
- **Control de Versiones:** Git

### Estructura de Carpetas
```
local-weather-station/
├── app/                          # Next.js app directory
│   ├── api/                      # Endpoints API
│   │   ├── weather-data/         # Captura y consulta de datos
│   │   └── todays-stats/         # Estadísticas del día
│   └── dashboard/                # Página principal
├── components/
│   ├── weather/                  # Componentes del dashboard
│   │   ├── weather-dashboard.tsx
│   │   ├── weather-card.tsx
│   │   └── extremes-display.tsx
│   ├── todays-stats/             # Estadísticas
│   │   └── estadisticas-hoy.tsx
│   └── ui/                       # Componentes reutilizables
│       ├── modal-error.tsx       # Modal de alertas
│       ├── advertencia-card.tsx  # Card de advertencias
│       └── alert-dialog.tsx
├── lib/
│   ├── types/                    # TypeScript types
│   │   └── weather.ts
│   ├── utils/
│   │   ├── functions/
│   │   │   └── getTempColor.ts   # Lógica de color de temperatura
│   │   └── cn.ts                 # Utility para clases
│   └── db/                       # Conexión a BD
├── detalles-proyecto.md          # Este archivo
└── package.json
```

---

## 8. Flujo de Datos

```
┌─────────────────────────────────────────────────────────┐
│                      ESP01 Sensor                        │
│              (Temperatura + Humedad)                     │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP POST c/15 min
                     ▼
┌─────────────────────────────────────────────────────────┐
│              API Route: /api/weather-data               │
│         - Valida datos                                  │
│         - Almacena en BD                                │
│         - Retorna confirmación                          │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                  Base de Datos                          │
│              (Tabla: weather_readings)                  │
└────────────────────┬────────────────────────────────────┘
                     │
     ┌───────────────┼───────────────┐
     │               │               │
     ▼               ▼               ▼
  ┌────────┐   ┌──────────┐   ┌────────────┐
  │ Última │   │ Extremos │   │ Tendencias │
  │Medicion│   │  Diarios │   │    Hoy     │
  └────────┘   └──────────┘   └────────────┘
     │               │               │
     └───────────────┼───────────────┘
                     │
    ┌────────────────┴────────────────┐
    │                                 │
    ▼                                 ▼
┌──────────────────┐         ┌────────────────┐
│  SWR (cada 60s)  │         │ API Endpoints  │
│  /api/weather-   │         │ /api/todays-   │
│      data        │         │   stats/trend  │
└────────────────┬─┘         └────────┬───────┘
                 │                    │
                 └────────┬───────────┘
                          │
                          ▼
              ┌──────────────────────┐
              │  Weather Dashboard   │
              │  - Valores actuales  │
              │  - Extremos          │
              │  - Tendencias        │
              │  - Estadísticas      │
              │  - Alertas           │
              └──────────────────────┘
```

---

## 9. Estados de Conexión

```
NORMAL (< 20 min)
└─ Sin advertencias
└─ Card verde (implícita)
└─ Valores mostrados como actuales

        ↓ (> 20 min)

WARNING (20-30 min)
└─ Card amarilla visible
└─ Título: "Advertencia: Valores no actualizados"
└─ Descripción: "No se ha recibido la última medición..."
└─ Valores siguen visibles

        ↓ (> 30 min)

ERROR (> 30 min)
└─ Card roja visible
└─ Título: "Error: Conexión perdida con el sensor"
└─ Modal de error se muestra (una sola vez)
└─ Descripción: "Se perdió la conexión..."
└─ Valores siguen visibles pero con advertencia crítica
```

---

## 10. Modelo de Datos

### Tabla: weather_readings
```sql
CREATE TABLE weather_readings (
  id SERIAL PRIMARY KEY,
  temperature DECIMAL(5,2) NOT NULL,      -- Rango: -50 a 60°C
  humidity DECIMAL(5,2) NOT NULL,         -- Rango: 0 a 100%
  recorded_at TIMESTAMP NOT NULL,         -- Cuándo se midió
  created_at TIMESTAMP DEFAULT NOW(),     -- Cuándo se guardó
  INDEX(recorded_at DESC)                 -- Para consultas rápidas
);
```

---

## 11. Endpoints API

### POST /api/weather-data
**Descripción:** Recibe datos del ESP01 y los almacena

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

### GET /api/weather-data
**Descripción:** Obtiene últimos datos y extremos del día

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

### GET /api/todays-stats/trend
**Descripción:** Obtiene tendencias de temperatura y humedad del día

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

## 12. Componentes Reutilizables Implementados

### modal-error.tsx
- **Props:** `open`, `onOpenChange`, `title`, `description`
- **Uso:** Alertas críticas del sistema
- **Estilo:** AlertDialog de ShadcnUI
- **Ubicación:** `/components/ui/modal-error.tsx`

### advertencia-card.tsx
- **Props:** `nivel` (warning|error), `titulo`, `descripcion`
- **Uso:** Notificaciones no-modales
- **Colores:** Amarillo (warning), Rojo (error)
- **Ubicación:** `/components/ui/advertencia-card.tsx`

### weather-card.tsx
- **Props:** Múltiples (título, valor, unidad, icono, etc.)
- **Uso:** Mostrar valores individuales de sensores
- **Colores:** Dinámicos según temperatura

---

## 13. Consideraciones de Implementación

### Tolerancia de Fallos
- Sensor offline > 20 min: Advertencia visual
- Sensor offline > 30 min: Modal + Card de error
- Datos validados antes de almacenar
- Solo datos válidos se muestran

### Optimizaciones
- SWR para actualización eficiente
- Índices en BD para consultas rápidas
- Componentes React optimizados con memo si aplica
- Caché de respuestas API

### Seguridad
- Validación de rangos en backend
- Tipado TypeScript para prevenir errores
- Sanitización de entrada de datos
- Rate limiting en endpoints (futuro)

---

## 14. Roadmap Futuro

- [ ] Histórico de datos con gráficos (Chart.js/Recharts)
- [ ] Exportar datos a CSV
- [ ] Notificaciones por email si sensor falla
- [ ] Soporte para múltiples sensores
- [ ] Predicción de tendencias con ML
- [ ] Dark mode automático
- [ ] API de autenticación
- [ ] Base de datos distribuida para redundancia

---

## 15. Instrucciones de Setup

### Variables de Entorno
```env
# .env.local
DATABASE_URL=postgresql://user:password@localhost:5432/weather_station
API_PORT=3000
SENSOR_TIMEOUT_WARNING=20
SENSOR_TIMEOUT_ERROR=30
```

### Instalación
```bash
npm install
npm run dev
```

### Configurar ESP01
```
POST http://your-local-ip:3000/api/weather-data
Payload: {"temperature": XX.X, "humidity": XX.X}
Interval: 15 minutos
```

---

**Última actualización:** 6 de enero de 2026
**Estado:** Especificación Completa
**Versión:** 1.0
