# Guía: crear y modificar reglas de métricas

Cómo extender el sistema de resolución definido en `resolveActualesDisplay.ts`.

Documentación del flujo general: [metricas-actuales-resolucion.md](./metricas-actuales-resolucion.md).

## Conceptos clave

### Regla (`ActualesDisplayRule`)

```typescript
{
  id: string                    // Identificador único (depuración, logs)
  when: (ctx, config) => boolean // Condición de activación
  layout: {
    tertiaryCard: ActualesMetric
    secondaryCard: ActualesMetric
    showDewPointCard: boolean
  }
}
```

### Prioridad

Las reglas viven en un **array ordenado**. Se usa `Array.find`: la **primera** regla con `when === true` gana.

- Reglas **más específicas** → al **inicio** del array
- Regla **fallback** (ej. `day-warm` con `when: () => true`) → al **final**

### Config vs. valores fijos

Usar `config` dentro de `when` cuando el umbral sea configurable:

```typescript
// ✅ Correcto — respeta overrides de config
displayPredicates.temperatureBelow(config.heatIndexMinTempC)

// ❌ Evitar — ignora si alguien pasa otra config
displayPredicates.temperatureBelow(20)
```

## Pasos para agregar una regla

### 1. Definir la condición

Usar predicados existentes o crear una función inline:

```typescript
{
  id: "cold-humid",
  when: displayPredicates.and(
    displayPredicates.isDaytime,
    displayPredicates.temperatureBelow(config.heatIndexMinTempC),
    (ctx) => ctx.humidity !== null && ctx.humidity >= 80,
  ),
  layout: { /* ... */ },
}
```

Si necesitás un predicado reutilizable, agregalo a `displayPredicates` en `resolveActualesDisplay.ts`.

### 2. Elegir el layout

| Campo | Pregunta a responder |
|-------|---------------------|
| `tertiaryCard` | ¿Qué va en la 3ª card grande? |
| `secondaryCard` | ¿Qué va en la 1ª card de la fila inferior? |
| `showDewPointCard` | ¿Mostrar además la card fija de punto de rocío? |

### 3. Insertar en el array

En `DEFAULT_ACTUALES_DISPLAY_RULES`, colocar la regla **antes** de reglas más generales:

```typescript
export const DEFAULT_ACTUALES_DISPLAY_RULES: ActualesDisplayRule[] = [
  { id: "night", /* ... */ },
  { id: "cold-humid", /* nueva, más específica que cold */ },
  { id: "cold", /* ... */ },
  { id: "day-warm", when: () => true, /* fallback */ },
]
```

### 4. Verificar que la métrica esté soportada

Si agregás un valor nuevo a `ActualesMetric`, también hay que implementarlo en `actuales-metric-card.tsx`.

## Ejemplos

### Mostrar punto de rocío en la card principal cuando hace frío

```typescript
{
  id: "cold-dew-point",
  when: (ctx, config) =>
    displayPredicates.and(
      displayPredicates.isDaytime,
      displayPredicates.temperatureBelow(config.heatIndexMinTempC),
    )(ctx, config),
  layout: {
    tertiaryCard: "dew-point",
    secondaryCard: "pressure",
    showDewPointCard: false, // evita duplicar punto de rocío abajo
  },
},
```

Insertar **antes** de `cold` si debe tener prioridad sobre presión + altitud.

### Índice de calor solo con humedad alta

```typescript
{
  id: "day-warm-humid",
  when: displayPredicates.and(
    displayPredicates.isDaytime,
    displayPredicates.temperatureAtOrAbove(config.heatIndexMinTempC),
    (ctx) => ctx.humidity !== null && ctx.humidity >= 50,
  ),
  layout: {
    tertiaryCard: "heat-index",
    secondaryCard: "pressure",
    showDewPointCard: true,
  },
},
```

Ajustar el fallback `day-warm` para cubrir día cálido con humedad baja (por ejemplo, mostrar presión).

### Cambiar umbrales sin tocar reglas

```typescript
resolveActualesDisplay(ctx, DEFAULT_ACTUALES_DISPLAY_RULES, {
  ...DEFAULT_ACTUALES_DISPLAY_CONFIG,
  heatIndexMinTempC: 25,
  dayStartMinutes: 7 * 60,
  dayEndMinutes: 21 * 60,
})
```

## Consideraciones importantes

### Duplicar métricas en pantalla

La fila inferior puede mostrar hasta **dos** cards: `secondaryCard` + punto de rocío (si `showDewPointCard`).

| tertiaryCard | secondaryCard | showDewPointCard | ¿Problema? |
|--------------|---------------|------------------|------------|
| `pressure` | `pressure` | `true` | Presión duplicada |
| `dew-point` | — | `true` | Punto de rocío duplicado |
| `dew-point` | `pressure` | `false` | OK |
| `heat-index` | `pressure` | `true` | OK (comportamiento por defecto) |

Antes de publicar una regla, revisar que no se repita la misma métrica en dos slots visibles.

### Temperatura `null`

`temperatureBelow` y `temperatureAtOrAbove` devuelven `false` si `temperature === null`. En ese caso no se activan reglas que dependan de temperatura; puede caer en `day-warm` (fallback) y mostrar índice de calor sin datos de temperatura fiables. Si eso es un problema, agregar una regla explícita para datos incompletos.

### Hora del dispositivo

- `isDaytime` usa la hora **local del navegador**, no la de la estación ni UTC.
- El resolver en `actuales-display.tsx` no se re-ejecuta al cambiar la hora sola (ver `useMemo`). Para actualizar al pasar de día a noche sin recargar:

```typescript
const [now, setNow] = useState(() => new Date())

useEffect(() => {
  const id = setInterval(() => setNow(new Date()), 60_000)
  return () => clearInterval(id)
}, [])

const layout = useMemo(
  () => resolveActualesDisplay({ now, temperature, humidity, pressure, altitude }),
  [now, temperature, humidity, pressure, altitude],
)
```

### Índice de calor vs. mostrar índice de calor

El cálculo del índice de calor ocurre en la API (`calculateHeatIndex`). Las reglas solo controlan si se **muestra** la card. No es necesario cambiar la API al ocultar el índice en frío.

### Agregar una métrica nueva (ej. velocidad del viento)

1. Extender `ActualesMetric` en `resolveActualesDisplay.ts`
2. Pasar el dato en `ActualesDisplayContext`
3. Implementar el caso en `actuales-metric-card.tsx`
4. Pasar el prop desde `actuales-display.tsx` y `weather-dashboard.tsx`
5. Crear reglas que usen la nueva métrica

### Testing manual rápido

En consola del navegador o con un script, probar combinaciones:

```typescript
import { resolveActualesDisplay } from "./resolveActualesDisplay"

const noon = new Date("2026-05-16T12:00:00")
const night = new Date("2026-05-16T22:00:00")

resolveActualesDisplay({ now: noon, temperature: 8.4, humidity: 77.9, pressure: 1013, altitude: 500 })
// → matchedRuleId: "cold"

resolveActualesDisplay({ now: noon, temperature: 28, humidity: 60, pressure: 1013, altitude: 500 })
// → matchedRuleId: "day-warm"
```

### Reglas en tests (futuro)

Si se agrega un runner de tests, conviene exportar `resolveActualesDisplay` con reglas inyectables:

```typescript
const layout = resolveActualesDisplay(ctx, customRules, customConfig)
```

Así cada regla se prueba de forma aislada sin depender del array por defecto.

## Checklist antes de mergear

- [ ] La regla nueva está en la posición correcta del array (prioridad)
- [ ] Usa `config` para umbrales configurables
- [ ] No duplica métricas en pantalla
- [ ] El fallback `day-warm` sigue al final
- [ ] `id` es único y descriptivo
- [ ] Si la métrica es nueva, está implementada en `actuales-metric-card.tsx`
- [ ] Probados escenarios: noche, día frío, día cálido, temperatura `null`
