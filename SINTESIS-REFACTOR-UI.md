# Sintesis General de Cambios - Refactor UI

Fecha: 21/03/2026

## Objetivo del refactor
Migrar la experiencia de una home monolitica a una navegacion tipo app mobile con barra inferior y secciones separadas, reutilizando la mayor cantidad posible de componentes existentes.

## Cambios implementados

### 1. Nueva navegacion global inferior
- Se agrego `components/bottom-navigation.tsx`.
- La barra incluye 3 destinos:
  - `/inicio`
  - `/estadisticas-hoy`
  - `/historial`
- Tiene estado activo por `pathname` y se renderiza fija al fondo.

### 2. Actualizacion de layout compartido
- Se modifico `app/layout.tsx` para:
  - Incluir `BottomNavigation` al final del layout.
  - Agregar `pb-24` al contenedor de `children` para evitar solapamiento con la barra inferior.

### 3. Nueva estructura de paginas
Se crearon nuevas rutas con foco por funcionalidad:
- `app/inicio/page.tsx`
  - Reutiliza `ActualesDisplay`, `ProximasHorasDisplay`, `AdvertenciaCard`, `ModalError`.
  - Consume hooks nuevos para datos, tendencias y estado de conexion.

- `app/estadisticas-hoy/page.tsx`
  - Reutiliza `EstadisticasHoy`, `ExtremesDisplay`, `CurveToday`.
  - Consume datos de clima y tendencias via hooks.

- `app/historial/page.tsx`
  - Migra la experiencia de historial (busqueda por dias + cards de dias + estado de carga/error).

### 4. Redirecciones de compatibilidad
- `app/page.tsx` ahora redirige a `/inicio`.
- `app/weather-history/page.tsx` ahora redirige a `/historial`.
- Objetivo: no romper accesos antiguos mientras se adopta la nueva estructura.

### 5. Simplificacion de header
- Se ajusto `components/header.tsx`:
  - Menor altura y tamano visual.
  - Link principal actualizado a `/inicio`.

### 6. Desacople de logica de datos en hooks
Se crearon hooks reutilizables:
- `hooks/use-weather-data.ts`
  - Centraliza SWR de `/api/weather-data` con refresh cada 60s.

- `hooks/use-trends.ts`
  - Centraliza consumo de `/api/todays-stats/trend`.

- `hooks/use-connection-status.ts`
  - Calcula estado de conexion (`normal`, `warning`, `error`) segun timestamp de ultima medicion.
  - Maneja `lastUpdate` y apertura del modal de error.

- `hooks/use-hourly-averages.ts`
  - Unifica lectura de promedios horarios para hoy o por fecha.

### 7. Refactor de componentes para reutilizar hooks
- `components/todays-stats/curve-today.tsx`
  - Elimina `fetch` manual y usa `useHourlyAverages()`.

- `components/weather-history/modal-details.tsx`
  - Elimina `fetch` interno y usa `useHourlyAverages(day, open)`.

- `components/weather/day-history-card.tsx`
  - Elimina estado/fetch duplicado de detalle y delega carga al modal.

## Resultado funcional esperado
- Navegacion centralizada por barra inferior con 3 secciones claras.
- Menor acoplamiento entre vista y logica de datos.
- Menos fetches repetidos en componentes de grafica y detalle historico.
- Base mas mantenible para continuar el refactor.

## Archivos principales modificados
- `app/layout.tsx`
- `app/page.tsx`
- `app/weather-history/page.tsx`
- `app/inicio/page.tsx` (nuevo)
- `app/estadisticas-hoy/page.tsx` (nuevo)
- `app/historial/page.tsx` (nuevo)
- `components/bottom-navigation.tsx` (nuevo)
- `components/header.tsx`
- `components/todays-stats/curve-today.tsx`
- `components/weather-history/modal-details.tsx`
- `components/weather/day-history-card.tsx`
- `hooks/use-weather-data.ts` (nuevo)
- `hooks/use-trends.ts` (nuevo)
- `hooks/use-connection-status.ts` (nuevo)
- `hooks/use-hourly-averages.ts` (nuevo)

## Nota de integracion con remoto
Durante la sincronizacion (`git pull`) aparecieron conflictos porque remoto tambien modifico archivos clave:
- `app/page.tsx`
- `app/weather-history/page.tsx`
- `components/weather/day-history-card.tsx`

Se recomienda conservar este archivo como referencia de fusion para resolver conflictos con criterio funcional.

## Proximos pasos sugeridos
1. Resolver merge/rebase y validar conflictos en las 3 rutas clave.
2. Ejecutar validaciones (`lint` y `build`) en entorno con gestor de paquetes disponible.
3. Limpiar componentes legacy que queden sin uso (`WeatherDashboard`, `IrAlHistorialCard`) si corresponde al alcance final.
