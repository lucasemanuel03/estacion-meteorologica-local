# Resolución de métricas en "Valores actuales"

Este documento describe cómo el sistema decide qué información mostrar en las cards variables del bloque **Valores actuales** del dashboard.

## Archivos involucrados

| Archivo | Rol |
|---------|-----|
| `resolveActualesDisplay.ts` | Motor de reglas: evalúa condiciones y devuelve el layout |
| `components/weather/actuales-display.tsx` | Consume el layout y renderiza las cards |
| `components/weather/actuales-metric-card.tsx` | Mapea cada métrica a su componente visual |

Para crear o modificar reglas, ver [metricas-actuales-reglas.md](./metricas-actuales-reglas.md).

## Objetivo

No todas las métricas son relevantes en todo momento. Por ejemplo:

- El **índice de calor** solo tiene sentido con temperaturas altas y durante el día.
- La **presión atmosférica** con tendencia es más útil de noche o cuando hace frío.
- El **punto de rocío** complementa temperatura y humedad en condiciones frías o húmedas.

El resolver centraliza esa lógica fuera del JSX para que sea fácil de extender sin duplicar condicionales en el componente.

## Flujo general

```
ActualesDisplay (props: T, HR, presión, altitud, heatIndex, prediction)
        │
        ▼
resolveActualesDisplay(contexto, reglas, config)
        │
        ├─ Recorre DEFAULT_ACTUALES_DISPLAY_RULES en orden
        ├─ Evalúa `when` de cada regla con el contexto
        └─ Devuelve la primera regla que cumple → layout
        │
        ▼
ActualesMetricCard × 2  +  card opcional de punto de rocío
```

## Estructura del layout

El resultado de `resolveActualesDisplay` es un `ActualesDisplayLayout`:

| Campo | Descripción |
|-------|-------------|
| `tertiaryCard` | Métrica de la **tercera card** de la fila principal (junto a temperatura y humedad) |
| `secondaryCard` | Métrica de la **primera card** de la fila inferior |
| `showDewPointCard` | Si se muestra la card fija de **punto de rocío** en la fila inferior |
| `matchedRuleId` | ID de la regla que ganó (útil para depuración) |

### Cards fijas (no las decide el resolver)

Estas siempre se muestran y no dependen de las reglas:

1. **Temperatura** — fila principal
2. **Humedad** — fila principal
3. **Punto de rocío** — fila inferior, solo si `showDewPointCard === true`

## Métricas disponibles

Tipo `ActualesMetric`:

| Valor | Componente | Datos que usa |
|-------|------------|---------------|
| `heat-index` | `HeatIndexCard` | `heatIndex` (calculado en API) |
| `pressure` | `WeatherCard` / `SecondaryWeatherCard` | `pressure`, `prediction` (tendencia ΔP) |
| `dew-point` | `WeatherCard` / `SecondaryWeatherCard` | `temperature`, `humidity` → `calcularPuntoRocio` |
| `altitude` | `WeatherCard` / `SecondaryWeatherCard` | `altitude` |

## Contexto de evaluación

`ActualesDisplayContext` provee los datos para las condiciones:

```typescript
{
  now?: Date              // Hora local del dispositivo (default: new Date())
  temperature: number | null
  humidity: number | null
  pressure: number | null
  altitude: number | null
}
```

La hora se interpreta en **minutos locales** desde medianoche (`getHours() * 60 + getMinutes()`), usando la zona horaria del navegador del usuario.

## Configuración por defecto

`DEFAULT_ACTUALES_DISPLAY_CONFIG`:

| Parámetro | Valor | Significado |
|-----------|-------|-------------|
| `dayStartMinutes` | `360` (06:00) | Inicio del horario diurno (inclusive) |
| `dayEndMinutes` | `1200` (20:00) | Fin del horario diurno (inclusive) |
| `heatIndexMinTempC` | `20` | Por debajo de esta temperatura no se muestra índice de calor |

## Reglas activas (orden de prioridad)

Las reglas se evalúan **de arriba hacia abajo**. Gana la primera cuya condición `when` sea verdadera.

### 1. `night` — Noche

- **Condición:** hora fuera del rango 06:00–20:00
- **Layout:**
  - Tercera card → presión atmosférica
  - Fila inferior → altitud
  - Punto de rocío → visible

### 2. `cold` — Día frío

- **Condición:** es de día **y** temperatura &lt; `heatIndexMinTempC` (20 °C)
- **Layout:** igual que noche (presión + altitud + punto de rocío)
- **Motivo:** el índice de calor no aporta en frío; la fórmula del NWS tampoco es válida en esas condiciones

### 3. `day-warm` — Día cálido (fallback)

- **Condición:** `() => true` (siempre, si ninguna regla anterior aplicó)
- **Layout:**
  - Tercera card → índice de calor
  - Fila inferior → presión atmosférica
  - Punto de rocío → visible

## Tabla resumen por escenario

| Escenario | Hora | Temp. | 3ª card | 2ª fila (izq.) | Punto de rocío |
|-----------|------|-------|---------|----------------|----------------|
| Día cálido | 06:00–20:00 | ≥ 20 °C | Índice de calor | Presión | Sí |
| Día frío | 06:00–20:00 | &lt; 20 °C | Presión | Altitud | Sí |
| Noche | resto | cualquiera | Presión | Altitud | Sí |

## Predicados reutilizables

Definidos en `displayPredicates` dentro de `resolveActualesDisplay.ts`:

- `isDaytime` / `isNighttime` — según `dayStartMinutes` y `dayEndMinutes`
- `temperatureBelow(celsius)` — temperatura estrictamente menor
- `temperatureAtOrAbove(celsius)` — temperatura mayor o igual
- `and(...)` / `or(...)` — composición de condiciones

## Integración en el componente

`actuales-display.tsx` llama al resolver dentro de un `useMemo`:

```typescript
const layout = useMemo(
  () => resolveActualesDisplay({ now: new Date(), temperature, humidity, pressure, altitude }),
  [temperature, humidity, pressure, altitude],
)
```

**Importante:** `now` no está en las dependencias del `useMemo`. El layout basado en hora solo se recalcula cuando cambian las lecturas del sensor, no al cruzar las 06:00 o las 20:00. Si se necesita actualización automática por hora, hay que añadir un estado de tiempo con intervalo (ver consideraciones en [metricas-actuales-reglas.md](./metricas-actuales-reglas.md)).

## Relación con el índice de calor (API)

El índice de calor se calcula siempre en el backend (`heat-index.ts`), pero **mostrarlo** depende de la regla `day-warm`. En frío o de noche la card de índice de calor no se renderiza aunque el valor exista en la respuesta de la API.
