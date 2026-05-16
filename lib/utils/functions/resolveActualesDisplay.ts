/**
 * Resuelve qué métricas mostrar en las cards variables de "Valores actuales".
 * Las reglas se evalúan en orden; gana la primera que cumpla su condición.
 */

export type ActualesMetric = "heat-index" | "pressure" | "dew-point" | "altitude"

export interface ActualesDisplayContext {
  now?: Date
  temperature: number | null
  humidity: number | null
  pressure: number | null
  altitude: number | null
}

export interface ActualesDisplayConfig {
  /** Hora local (inclusive) a partir de la cual es de día */
  dayStartMinutes: number
  /** Hora local (inclusive) hasta la cual es de día */
  dayEndMinutes: number
  /** Por debajo de esta temperatura no se muestra el índice de calor */
  heatIndexMinTempC: number
}

export interface ActualesDisplayLayout {
  tertiaryCard: ActualesMetric
  secondaryCard: ActualesMetric
  /** Card fija de punto de rocío en la fila inferior */
  showDewPointCard: boolean
  matchedRuleId: string
}

export type ActualesDisplayRule = {
  id: string
  when: (ctx: ActualesDisplayContext, config: ActualesDisplayConfig) => boolean
  layout: Omit<ActualesDisplayLayout, "matchedRuleId">
}

export const DEFAULT_ACTUALES_DISPLAY_CONFIG: ActualesDisplayConfig = {
  dayStartMinutes: 6 * 60,
  dayEndMinutes: 20 * 60,
  heatIndexMinTempC: 20,
}

function getLocalMinutes(date: Date): number {
  return date.getHours() * 60 + date.getMinutes()
}

/** Predicados reutilizables para componer reglas */
export const displayPredicates = {
  isDaytime:
    (ctx: ActualesDisplayContext, config: ActualesDisplayConfig) => {
      const minutes = getLocalMinutes(ctx.now ?? new Date())
      return minutes >= config.dayStartMinutes && minutes <= config.dayEndMinutes
    },

  isNighttime:
    (ctx: ActualesDisplayContext, config: ActualesDisplayConfig) =>
      !displayPredicates.isDaytime(ctx, config),

  temperatureBelow:
    (celsius: number) => (ctx: ActualesDisplayContext) =>
      ctx.temperature !== null && ctx.temperature < celsius,

  temperatureAtOrAbove:
    (celsius: number) => (ctx: ActualesDisplayContext) =>
      ctx.temperature !== null && ctx.temperature >= celsius,

  and:
    (...conditions: Array<(ctx: ActualesDisplayContext, config: ActualesDisplayConfig) => boolean>) =>
    (ctx: ActualesDisplayContext, config: ActualesDisplayConfig) =>
      conditions.every((condition) => condition(ctx, config)),

  or:
    (...conditions: Array<(ctx: ActualesDisplayContext, config: ActualesDisplayConfig) => boolean>) =>
    (ctx: ActualesDisplayContext, config: ActualesDisplayConfig) =>
      conditions.some((condition) => condition(ctx, config)),
}

/**
 * Reglas por defecto. Para agregar una condición, inserta un objeto al inicio
 * (mayor prioridad) o antes del fallback `day-warm`.
 */
export const DEFAULT_ACTUALES_DISPLAY_RULES: ActualesDisplayRule[] = [
  {
    id: "night",
    when: displayPredicates.isNighttime,
    layout: {
      tertiaryCard: "pressure",
      secondaryCard: "altitude",
      showDewPointCard: true,
    },
  },
  {
    id: "cold",
    when: (ctx, config) =>
      displayPredicates.and(
        displayPredicates.isDaytime,
        displayPredicates.temperatureBelow(config.heatIndexMinTempC),
      )(ctx, config),
    layout: {
      tertiaryCard: "pressure",
      secondaryCard: "altitude",
      showDewPointCard: true,
    },
  },
  {
    id: "day-warm",
    when: () => true,
    layout: {
      tertiaryCard: "heat-index",
      secondaryCard: "pressure",
      showDewPointCard: true,
    },
  },
]

export function resolveActualesDisplay(
  ctx: ActualesDisplayContext,
  rules: ActualesDisplayRule[] = DEFAULT_ACTUALES_DISPLAY_RULES,
  config: ActualesDisplayConfig = DEFAULT_ACTUALES_DISPLAY_CONFIG,
): ActualesDisplayLayout {
  const rule = rules.find((entry) => entry.when(ctx, config)) ?? rules[rules.length - 1]

  return {
    ...rule.layout,
    matchedRuleId: rule.id,
  }
}
